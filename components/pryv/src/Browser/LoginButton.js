/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const Cookies = require('./CookieUtils');
const AuthStates = require('../Auth/AuthStates');
const AuthController = require('../Auth/AuthController');
const Messages = require('../Auth/LoginMessages');
const utils = require('../utils');

/* global location, confirm */

/**
 * @memberof pryv.Browser
 */
class LoginButton {
  constructor (authSettings, service) {
    this.authSettings = authSettings;
    this.service = service;
    this.serviceInfo = service.infoSync();
  }

  /**
   * setup button and load assets
   */
  async init () {
    // initialize button visuals
    setupButton(this);
    this.languageCode = this.authSettings.authRequest.languageCode || 'en';
    this.messages = Messages(this.languageCode);
    // @ts-ignore - loginButtonText is set by setupButton
    if (this.loginButtonText) {
      await loadAssets(this);
    }
    // set cookie key for authorization data
    this._cookieKey = 'pryv-libjs-' + this.authSettings.authRequest.requestingAppId;

    // initialize controller
    this.auth = new AuthController(this.authSettings, this.service, this);
    await this.auth.init();

    return this.service;
  }

  onClick () {
    this.auth.handleClick();
  }

  async onStateChange (state) {
    switch (state.status) {
      case AuthStates.LOADING:
        this.text = getLoadingMessage(this);
        break;
      case AuthStates.INITIALIZED:
        this.text = getInitializedMessage(this, this.serviceInfo.name);
        break;
      case AuthStates.NEED_SIGNIN: {
        const loginUrl = state.authUrl || state.url; // url is deprecated
        if (this.authSettings.authRequest.returnURL) { // open on same page (no Popup)
          location.href = loginUrl;
          return;
        } else {
          startLoginScreen(this, loginUrl);
        }
        break;
      }
      case AuthStates.AUTHORIZED:
        this.text = state.username;
        this.saveAuthorizationData(Object.assign({
          apiEndpoint: state.apiEndpoint,
          username: state.username
        },
        // Kept to locate the account app after a reload (see AuthController.accountUrl).
        (state.authUrl || this.auth?._authUrl) ? { authUrl: state.authUrl || this.auth._authUrl } : {}));
        break;
      case AuthStates.SIGNOUT: {
        // A confirmed logout (the menu's "Log out", or `auth.signOut()`)
        // clears the credentials itself.
        if (this.auth?._signingOut) break;
        const message = this.messages.SIGNOUT_CONFIRM ? this.messages.SIGNOUT_CONFIRM : 'Logout ?';
        if (confirm(message)) {
          this.deleteAuthorizationData();
          this.auth.init();
        }
        break;
      }
      case AuthStates.ERROR:
        this.text = getErrorMessage(this, state.message);
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + state.status);
    }
    // @ts-ignore - loginButtonText is set by setupButton
    if (this.loginButtonText) {
      // @ts-ignore
      this.loginButtonText.innerHTML = this.text;
    }
  }

  /**
   * Open the account menu (signed-in account, "Manage my account",
   * "Log out"). Returns false, and opens nothing, when the menu is disabled
   * with `settings.menu: false`: the caller then falls back to the logout
   * confirmation.
   * @returns {boolean}
   */
  showMenu () {
    if (this.authSettings.menu === false || typeof document === 'undefined') return false;
    this.closeMenu();
    this.menu = buildMenu(this);
    document.body.appendChild(this.menu.overlay);
    this.menu.focusables()[0]?.focus();
    return true;
  }

  /** Close the account menu if it is open. */
  closeMenu () {
    if (this.menu == null) return;
    const menu = this.menu;
    this.menu = null;
    document.removeEventListener('keydown', menu.onKeyDown, true);
    if (menu.overlay.parentNode != null) menu.overlay.parentNode.removeChild(menu.overlay);
    if (menu.previousFocus != null && typeof menu.previousFocus.focus === 'function') {
      menu.previousFocus.focus();
    }
  }

  getAuthorizationData () {
    return Cookies.get(this._cookieKey);
  }

  saveAuthorizationData (authData) {
    Cookies.set(this._cookieKey, authData);
  }

  async deleteAuthorizationData () {
    Cookies.del(this._cookieKey);
  }

  /**
   * not mandatory to implement as non-browsers don't have this behaviour
   * @param {*} authController
   */
  async finishAuthProcessAfterRedirection (authController) {
    // this step should be applied only for the browser
    if (!utils.isBrowser()) return;

    // 3. Check if there is a pryvKey / pryvPoll (or legacy prYvkey /
    //    prYvpoll) as result of "out of page login"
    const url = window.location.href;
    const pollUrl = retrievePollUrl(url);
    if (pollUrl !== null) {
      try {
        const { body } = await utils.fetchGet(pollUrl);
        authController.state = body;
      } catch (e) {
        authController.state = {
          status: AuthStates.ERROR,
          message: 'Cannot fetch result',
          error: e
        };
      }
      // These params are one-shot; leaving them in the visible URL puts
      // stale auth state into bookmarks / copied links.
      if (window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', utils.cleanURLFromPrYvParams(url));
      }
    }

    function retrievePollUrl (url) {
      // Modern lowercase form (pryvKey / pryvPoll) is preferred; the
      // capital-Y form (prYvkey / prYvpoll) is accepted for back-compat
      // with apps emitting the legacy URL contract — see
      // [DEPRECATED] notes on cleanURLFromPrYvParams.
      const params = utils.getQueryParamsFromURL(url);
      let pollUrl = null;
      const key = params.pryvKey || params.prYvkey;
      if (key) {
        pollUrl = authController.serviceInfo.access + key;
      }
      const poll = params.pryvPoll || params.prYvpoll;
      if (poll) {
        pollUrl = poll;
      }
      return pollUrl;
    }
  }
}

module.exports = LoginButton;

async function startLoginScreen (loginButton, authUrl) {
  const screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft;
  const screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop;
  const outerWidth = typeof window.outerWidth !== 'undefined' ? window.outerWidth : document.body.clientWidth;
  const outerHeight = typeof window.outerHeight !== 'undefined' ? window.outerHeight : (document.body.clientHeight - 22);
  const width = 400;
  const height = 620;
  const left = Math.floor(screenX + ((outerWidth - width) / 2));
  const top = Math.floor(screenY + ((outerHeight - height) / 2.5));
  const features = (
    'width=' + width +
    ',height=' + height +
    ',left=' + left +
    ',top=' + top +
    ',scrollbars=yes'
  );
  loginButton.popup = window.open(authUrl, 'prYv Sign-in', features);

  if (!loginButton.popup) {
    // loginButton.auth.stopAuthRequest('FAILED_TO_OPEN_WINDOW');
    console.log('Pop-up blocked. A second click should allow it.');
  } else if (window.focus) {
    loginButton.popup.focus();
  }
}

const MENU_OPTIONS = ['logout', 'account', 'info'];

/**
 * Which menu entries to show: all by default; `settings.menu.<option>: false`
 * or `settings.menu.hide: ['<option>', ...]` hides one.
 */
function menuOptions (menuSettings) {
  const options = {};
  MENU_OPTIONS.forEach((o) => { options[o] = true; });
  if (menuSettings != null && typeof menuSettings === 'object') {
    MENU_OPTIONS.forEach((o) => { if (menuSettings[o] === false) options[o] = false; });
    if (Array.isArray(menuSettings.hide)) {
      menuSettings.hide.forEach((o) => { if (o in options) options[o] = false; });
    }
  }
  return options;
}

const MENU_CSS = `
.pryv-menu-overlay { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 2147483000; display: flex;
  align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.35); }
.pryv-menu { background: #fff; color: #222; min-width: 280px; max-width: 90vw; border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); font: 14px/1.4 system-ui, sans-serif; }
.pryv-menu-header { display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; padding: 16px 16px 8px; }
.pryv-menu-username { font-weight: 600; font-size: 16px; overflow-wrap: anywhere; }
.pryv-menu-info { color: #666; font-size: 13px; padding: 0 16px 12px; overflow-wrap: anywhere; }
.pryv-menu-close { border: 0; background: none; font-size: 20px; line-height: 1; cursor: pointer; color: #666; }
.pryv-menu-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end;
  padding: 12px 16px 16px; border-top: 1px solid #eee; }
.pryv-menu-actions button { padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc;
  background: #f7f7f7; cursor: pointer; font: inherit; }
.pryv-menu-actions button:focus-visible, .pryv-menu-close:focus-visible { outline: 2px solid #4a90d9; }
`;

/** The built-in menu style, added once. A service's button CSS can override
 * the `.pryv-menu*` classes. */
function ensureMenuStyle () {
  if (document.getElementById('pryv-menu-style') != null) return;
  const style = document.createElement('style');
  style.id = 'pryv-menu-style';
  style.textContent = MENU_CSS;
  // First in <head>: a service stylesheet loaded before or after the menu
  // opens then wins at equal specificity.
  document.head.insertBefore(style, document.head.firstChild);
}

function menuElement (tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

/**
 * Build the account menu: a modal dialog, closed by its close button,
 * Escape, or a click outside it, with focus kept inside while open.
 */
function buildMenu (loginBtn) {
  ensureMenuStyle();
  const auth = loginBtn.auth;
  const messages = Object.assign({}, loginBtn.messages, auth.messages);
  const options = menuOptions(loginBtn.authSettings.menu);
  const username = auth.state?.username || '';

  const overlay = menuElement('div', 'pryv-menu-overlay');
  const dialog = menuElement('div', 'pryv-menu');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'pryv-menu-username');
  overlay.appendChild(dialog);

  const header = menuElement('div', 'pryv-menu-header');
  const title = menuElement('div', 'pryv-menu-username', username || messages.MENU_TITLE);
  title.id = 'pryv-menu-username';
  header.appendChild(title);
  const close = menuElement('button', 'pryv-menu-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', messages.CLOSE);
  close.addEventListener('click', () => loginBtn.closeMenu());
  header.appendChild(close);
  dialog.appendChild(header);

  if (options.info) {
    const serviceName = loginBtn.serviceInfo?.name || '';
    const appId = loginBtn.authSettings.authRequest.requestingAppId;
    dialog.appendChild(menuElement('div', 'pryv-menu-info', serviceName + ' · ' + messages.APP + ': ' + appId));
  }

  const actions = menuElement('div', 'pryv-menu-actions');
  if (options.account && auth.accountUrl() != null) {
    const manage = menuElement('button', 'pryv-menu-account', messages.MANAGE_ACCOUNT + ' ');
    const arrow = menuElement('span', null, '↗');
    arrow.setAttribute('aria-hidden', 'true');
    manage.appendChild(arrow);
    manage.type = 'button';
    manage.addEventListener('click', () => {
      auth.openAccountApp();
      loginBtn.closeMenu();
    });
    actions.appendChild(manage);
  }
  if (options.logout) {
    const logout = menuElement('button', 'pryv-menu-logout', messages.LOGOUT);
    logout.type = 'button';
    logout.addEventListener('click', () => {
      loginBtn.closeMenu();
      auth.signOut();
    });
    actions.appendChild(logout);
  }
  dialog.appendChild(actions);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) loginBtn.closeMenu();
  });

  const focusables = () => Array.from(dialog.querySelectorAll('button'));
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      loginBtn.closeMenu();
    } else if (event.key === 'Tab') {
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', onKeyDown, true);

  return { overlay, dialog, onKeyDown, focusables, previousFocus: document.activeElement };
}

function setupButton (loginBtn) {
  loginBtn.loginButtonSpan = document.getElementById(loginBtn.authSettings.spanButtonID);

  if (!loginBtn.loginButtonSpan) {
    console.log('WARNING: pryv.Browser initialized with no spanButtonID');
  } else {
    // up to the time the button is loaded use the Span to display eventual
    // error messages
    loginBtn.loginButtonText = loginBtn.loginButtonSpan;

    // bind actions dynamically to the button click
    loginBtn.loginButtonSpan.addEventListener('click', loginBtn.onClick.bind(loginBtn));
  }
}

/**
 * Loads the style from the service info
 */
async function loadAssets (loginBtn) {
  const assets = await loginBtn.service.assets();
  loginBtn.loginButtonSpan.innerHTML = await assets.loginButtonGetHTML();
  loginBtn.loginButtonText = document.getElementById('pryv-access-btn-text');
}

function getErrorMessage (loginButton, message) {
  return loginButton.messages.ERROR + ': ' + message;
}

function getLoadingMessage (loginButton) {
  return loginButton.messages.LOADING;
}

function getInitializedMessage (loginButton, serviceName) {
  return loginButton.messages.LOGIN + ': ' + serviceName;
}
