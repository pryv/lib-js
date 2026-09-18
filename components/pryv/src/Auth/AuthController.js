/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('../utils');
const AuthStates = require('./AuthStates');
const Messages = require('./LoginMessages');
const ProfileStore = require('./ProfileStore');
const handoff = require('../lib/handoff');

/**
 * Controller for authentication flow
 * @memberof pryv.Auth
 */
class AuthController {
  /**
   * Create an AuthController
   * @param {AuthSettings} settings - Authentication settings
   * @param {Service} service - Pryv service instance
   * @param {CustomLoginButton} loginButton - Login button implementation
   */
  constructor (settings, service, loginButton) {
    this.settings = settings;
    validateSettings.call(this, settings);

    this.stateChangeListeners = [];
    // External `onStateChange` callers only see `{ status, id, key, serviceInfo? }`
    // on AUTHORIZED — credentials (`username`, `token`, `apiEndpoint`) stay
    // inside the lib. Internal listeners (e.g. LoginButton, for cookie
    // autologin) get the full unfiltered state.
    if (this.settings.onStateChange) {
      const externalListener = this.settings.onStateChange;
      this.stateChangeListeners.push(function (state) {
        externalListener(filterForExternalListener(state));
      });
    }
    this.service = service;

    // probably remove
    this.languageCode = this.settings.authRequest.languageCode || 'en';
    this.messages = Messages(this.languageCode);

    this.loginButton = loginButton;
    // Incremented by every new auth request, sign-out and re-initialization:
    // an older request's poll then no longer changes the state.
    this._authFlowId = 0;
    /** @type {Object|null} signed-in state to return to if a switch does not complete */
    this._switchPrevious = null;

    function validateSettings (settings) {
      if (!settings) { throw new Error('settings cannot be null'); }
      // -- settings
      if (!settings.authRequest) { throw new Error('Missing settings.authRequest'); }

      // -- Extract returnURL
      settings.authRequest.returnURL =
        this.getReturnURL(settings.authRequest.returnURL);

      if (!settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      if (!settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }

      // Delivery mode. Default to the one-time shared-secret hand-off so the
      // token is never returned in the poll: a new core echoes
      // `credentialHandoff` and delivers a `handoff` key (redeemed once here),
      // an older core drops the field and falls back to inline delivery.
      // Opt out with `authRequest.credentialHandoff = 'inline'`, which sends no
      // field at all, so the request is byte-identical to the legacy one.
      if (settings.authRequest.credentialHandoff === 'inline') {
        delete settings.authRequest.credentialHandoff;
      } else if (settings.authRequest.credentialHandoff == null) {
        settings.authRequest.credentialHandoff = 'shared-secret';
      }
    }
  }

  /**
   * Initialize the auth controller. Call this right after instantiation.
   * @returns {Promise<Service>} Promise resolving to the Service instance
   */
  async init () {
    cancelAuthFlow(this);
    this.serviceInfo = this.service.infoSync();
    this.state = { status: AuthStates.LOADING };
    this.assets = await loadAssets(this);

    const loginButton = this.loginButton;
    // initialize human interaction interface
    if (loginButton != null) {
      // Register the button's state listener at most once: init() can run again
      // on the same controller (the LoginButton re-inits after a confirmed
      // logout), and a duplicate listener would fire the logout confirm twice
      // and compound the listener list on every re-login.
      if (!this._loginButtonListenerRegistered) {
        this.stateChangeListeners.push(loginButton.onStateChange.bind(loginButton));
        this._loginButtonListenerRegistered = true;
      }
      // autologin needs cookies/storage implemented in human interaction interface
      await checkAutoLogin(this);
    }

    // if auto login is not prompted
    if (this.state.status !== AuthStates.AUTHORIZED) {
      this.state = { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo };
    }

    if (loginButton != null && loginButton.finishAuthProcessAfterRedirection != null) {
      // @ts-ignore - this is a valid AuthController
      await loginButton.finishAuthProcessAfterRedirection(this);
    }

    return this.service;
  }

  /**
   * Stops poll for auth request
   */
  stopAuthRequest (msg) {
    // its poll must not change the state any more
    cancelAuthFlow(this);
    this.state = { status: AuthStates.ERROR, message: msg };
  }

  /**
   * Handle button click - triggers appropriate action based on current state
   * @returns {Promise<void>}
   */
  async handleClick () {
    if (isAuthorized.call(this)) {
      // A button with an account menu opens it (logout happens from there,
      // through `signOut()`); otherwise the legacy SIGNOUT state lets the
      // button confirm the logout itself.
      const loginButton = this.loginButton;
      if (loginButton != null && typeof loginButton.showMenu === 'function' &&
          loginButton.showMenu() !== false) {
        return;
      }
      this.state = { status: AuthStates.SIGNOUT };
    } else if (isInitialized.call(this)) {
      this.startAuthRequest();
    } else if (this.state.status === AuthStates.SWITCHING) {
      // a switch is running; its outcome arrives as a state change
    } else if (isNeedSignIn.call(this)) {
      // reopen popup (HACK for now: set to private property to avoid self-assignment)
      this.state = this._state;
    } else {
      console.log('Unhandled action in "handleClick()" for status:', this.state.status);
    }

    function isAuthorized () {
      return this.state.status === AuthStates.AUTHORIZED;
    }
    function isInitialized () {
      return this.state.status === AuthStates.INITIALIZED;
    }
    function isNeedSignIn () {
      return this.state.status === AuthStates.NEED_SIGNIN;
    }
  }

  /**
   * Log out: emit SIGNOUT once, forget the active account and return to
   * INITIALIZED. The other remembered accounts are kept (`all` forgets them
   * too). This is the confirmed logout (no further confirmation).
   * @param {Object} [options]
   * @param {boolean} [options.all] - forget every remembered account
   * @returns {Promise<void>}
   */
  async signOut (options) {
    const all = options?.all === true;
    cancelAuthFlow(this);
    const store = this._readProfiles();
    // during a switch, the account being left
    const current = this.state?.username ?? this.state?.from;
    this._signingOut = true;
    try {
      this.state = { status: AuthStates.SIGNOUT };
    } finally {
      this._signingOut = false;
    }
    // Drop any cached hand-off credential for this flow's key. Guard the
    // key: on a cookie-autologin session there is no `_authFlowKey`, and
    // clearing with `undefined` would wipe an unrelated concurrent flow.
    if (this._authFlowKey != null) handoff.cacheClear(this._authFlowKey);
    const others = current == null ? store.profiles : ProfileStore.remove(store, current).profiles;
    const loginButton = this.loginButton;
    if (!all && others.length > 0 && loginButton != null && typeof loginButton.saveAuthorizationData === 'function') {
      loginButton.saveAuthorizationData(ProfileStore.write(Object.assign({}, store, { active: null, profiles: others })));
    } else if (loginButton != null && typeof loginButton.deleteAuthorizationData === 'function') {
      await loginButton.deleteAuthorizationData();
    }
    await this.init();
  }

  /**
   * The accounts remembered for this app, most recently used first.
   * @returns {Array<{username: string, actingAs?: {username: string, delegate: string}, active: boolean, available: boolean}>}
   */
  profiles () {
    const current = this.currentProfile();
    return this._readProfiles().profiles.map((p) => {
      const out = { username: p.username, active: current != null && current.username === p.username, available: p.unavailable !== true };
      if (p.actingAs != null) out.actingAs = p.actingAs;
      return out;
    });
  }

  /**
   * The signed-in account, or null.
   * @returns {{username: string, actingAs?: {username: string, delegate: string}}|null}
   */
  currentProfile () {
    if (this.state?.status !== AuthStates.AUTHORIZED || this.state.profile == null) return null;
    const out = { username: this.state.profile.username };
    if (this.state.profile.actingAs != null) out.actingAs = this.state.profile.actingAs;
    return out;
  }

  /**
   * Switch to another account. `username` null means the signed-in person's
   * own account (switch back). A remembered account whose access is still
   * valid is activated without a sign-in; otherwise the auth request runs
   * again, asking for that account (`actAs`). Emits SWITCHING first; ends in
   * AUTHORIZED, or back on the previous account when the sign-in is refused.
   * @param {string|null} username
   * @returns {Promise<void>}
   */
  async switchTo (username) {
    const store = this._readProfiles();
    const current = this.currentProfile();
    let target;
    if (username == null) {
      if (current != null && current.actingAs == null) return;
      const delegate = current?.actingAs?.delegate;
      // Acting for an account: back to the delegate's own account only, never
      // to another remembered one. Not signed in: the most recent own account.
      target = delegate != null
        ? store.profiles.find((p) => p.username === delegate && p.actingAs == null)
        : store.profiles.find((p) => p.actingAs == null);
    } else {
      if (current != null && current.username === username) return;
      target = store.profiles.find((p) => p.username === username);
    }
    const toUsername = target?.username ?? username ?? null;
    const previous = restorableState(this.state);
    // a log out or re-initialization during the access check ends this switch
    cancelAuthFlow(this);
    const flowId = this._authFlowId;
    this.state = { status: AuthStates.SWITCHING, from: current?.username ?? null, to: toUsername };

    if (target != null && target.unavailable !== true) {
      let info;
      try {
        info = await this._accessInfo(target.apiEndpoint);
      } catch (e) {
        if (this._authFlowId !== flowId) throw e;
        // network failure: stay on the previous account
        this.state = previous ?? { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo };
        throw e;
      }
      if (this._authFlowId !== flowId) return;
      if (info != null && info.error == null) {
        const profile = profileFromAccessInfo(target, info);
        this.state = { status: AuthStates.AUTHORIZED, username: profile.username, apiEndpoint: profile.apiEndpoint, profile };
        return;
      }
      if (!ACCESS_GONE_ERRORS.includes(info?.error?.id)) {
        // any other answer (server error, rate limit) says nothing about the access
        this.state = previous ?? { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo };
        throw new Error('Cannot check the access of ' + target.username + ': ' + JSON.stringify(info?.error));
      }
      // revoked or expired (a detach revokes the accesses granted through it)
      this._saveProfiles(ProfileStore.markUnavailable(this._readProfiles(), target.username));
    }
    // own account: a sign-in that offers no other account; otherwise ask for that one
    await this.startAuthRequest({ actAs: username == null ? 'deny' : username }, previous);
  }

  /**
   * Sign in to one more account (the popup may offer the accounts the person
   * can act for); the remembered accounts are kept.
   * @returns {Promise<void>}
   */
  async addAccount () {
    const current = this.currentProfile();
    const previous = restorableState(this.state);
    this.state = { status: AuthStates.SWITCHING, from: current?.username ?? null, to: null };
    await this.startAuthRequest({ actAs: 'allow' }, previous);
  }

  /**
   * @private The access-info of a stored account (`{ error }` when refused).
   * @param {string} apiEndpoint
   */
  async _accessInfo (apiEndpoint) {
    // required here: Connection is not needed before the first switch
    const Connection = require('../Connection');
    return await new Connection(apiEndpoint).accessInfo(true);
  }

  /** @private */
  _readProfiles () {
    const loginButton = this.loginButton;
    if (loginButton == null || typeof loginButton.getAuthorizationData !== 'function') return ProfileStore.read(null);
    return ProfileStore.read(loginButton.getAuthorizationData());
  }

  /** @private */
  _saveProfiles (store) {
    const loginButton = this.loginButton;
    if (loginButton == null || typeof loginButton.saveAuthorizationData !== 'function') return;
    const data = ProfileStore.write(store);
    if (data == null && typeof loginButton.deleteAuthorizationData === 'function') {
      loginButton.deleteAuthorizationData();
    } else if (data != null) {
      loginButton.saveAuthorizationData(data);
    }
  }

  /**
   * URL of the account app (profile page) for this platform, or null when
   * it cannot be determined. Resolution order: `settings.accountUrl`, then
   * the service's `account`, then the auth page URL of the last auth
   * request with its trailing `/auth` removed.
   * @returns {string|null}
   */
  accountUrl () {
    let base = this.settings.accountUrl || this.serviceInfo?.account || accountUrlFromAuthUrl(this._authUrl);
    if (typeof base !== 'string' || base === '') return null;
    base = base.replace(/\/+$/, '');
    // @ts-ignore - Service keeps the URL it was created with
    const serviceInfoUrl = this.service?._serviceInfoUrl;
    return base + '/account/profile' +
      (serviceInfoUrl ? '?pryvServiceInfoUrl=' + encodeURIComponent(serviceInfoUrl) : '');
  }

  /**
   * Open the account app in a new tab.
   * @returns {string|null} the URL opened, or null when unknown
   */
  openAccountApp () {
    const url = this.accountUrl();
    if (url != null) window.open(url, '_blank', 'noopener');
    return url;
  }

  /**
   * Compute the return URL for authentication redirect.
   * Used only in browser environments.
   * @param {string} [returnURL] - The return URL setting ('auto#', 'self#', or custom URL)
   * @param {string} [windowLocationForTest] - Mock window.location.href for testing
   * @param {string|Navigator} [navigatorForTests] - Mock navigator for testing
   * @returns {string|boolean} The computed return URL, or false if using popup mode
   */
  getReturnURL (
    returnURL,
    windowLocationForTest,
    navigatorForTests
  ) {
    const RETURN_URL_AUTO = 'auto';

    returnURL = returnURL || RETURN_URL_AUTO + '#';

    // check the trailer
    const trailer = returnURL.slice(-1);
    if ('#&?'.indexOf(trailer) < 0) {
      throw new Error('Pryv access: Last character of --returnURL setting-- is not ' +
        '"?", "&" or "#": ' + returnURL);
    }
    // auto mode for desktop
    if (returnUrlIsAuto(returnURL) &&
        !utils.browserIsMobileOrTablet(navigatorForTests)) {
      return false;
    // auto mode for mobile or self
    } else if ((returnUrlIsAuto(returnURL) &&
                utils.browserIsMobileOrTablet(navigatorForTests)) ||
               returnURL.indexOf('self') === 0) {
      // set self as return url?
      // eventually clean-up current url from previous pryv returnURL
      const locationHref = windowLocationForTest || window.location.href;
      returnURL = locationHref + returnURL.substring(4);
    }
    return utils.cleanURLFromPrYvParams(returnURL);

    function returnUrlIsAuto (returnURL) {
      return returnURL.indexOf(RETURN_URL_AUTO) === 0;
    }
  }

  /**
   * Start the authentication request and polling process
   * @param {Object} [overrides] - auth request fields for this request only (e.g. `actAs`)
   * @param {Object} [previous] - AUTHORIZED state to return to when this
   *   request (an account switch) does not end in AUTHORIZED
   * @returns {Promise<void>}
   * @see https://pryv.github.io/reference/#auth-request
   */
  async startAuthRequest (overrides, previous) {
    cancelAuthFlow(this);
    const flowId = this._authFlowId;
    this._switchPrevious = previous ?? null;
    // @ts-ignore - postAccess uses .call(this) for context
    const requested = await postAccess.call(this);
    if (this._authFlowId !== flowId) return; // replaced while posting
    this.state = requested;
    // Remember the polling key so listeners on the terminal AUTHORIZED
    // state can be handed `{ key, serviceInfo? }` (the polling response
    // itself doesn't echo `key` back).
    this._authFlowKey = this.state?.key;
    // Kept to locate the account app when the service does not name it.
    if (this.state?.authUrl) this._authUrl = this.state.authUrl;

    await doPolling.call(this);

    /** @this {AuthController} */
    async function postAccess () {
      try {
        const { response, body } = await utils.fetchPost(
          // @ts-ignore - this is bound via .call()
          this.serviceInfo.access,
          // @ts-ignore - this is bound via .call()
          Object.assign({}, this.settings.authRequest, overrides)
        );
        if (!response.ok) {
          throw new Error('Access request failed: ' + JSON.stringify(body));
        }
        return body;
      } catch (e) {
        if (this._authFlowId !== flowId) throw e; // replaced while posting
        const previous = this._switchPrevious;
        this._switchPrevious = null;
        this.state = previous ?? {
          status: AuthStates.ERROR,
          message: 'Requesting access',
          error: e
        };
        throw e; // forward error
      }
    }

    /** @this {AuthController} */
    async function doPolling () {
      // @ts-ignore - this is bound via .call()
      if (this._authFlowId !== flowId || this.state?.status !== AuthStates.NEED_SIGNIN) {
        return;
      }
      // @ts-ignore - this is bound via .call()
      const pollResponse = await pollAccess(this.state?.poll);
      // a newer request, a sign-out or a re-initialization replaced this one
      // @ts-ignore - this is bound via .call()
      if (this._authFlowId !== flowId) return;

      if (pollResponse.status === AuthStates.NEED_SIGNIN) {
        // @ts-ignore - this is bound via .call()
        setTimeout(await doPolling.bind(this), this.state?.poll_rate_ms);
      } else {
        // Shared-secret delivery: the ACCEPTED body carries a one-time
        // `handoff` key, not the token. Redeem it once here (caching under the
        // poll key so a later connectFromKey reuses it) and rewrite the body to
        // the legacy shape, so the cookie / LoginButton path and the external
        // listener filter are untouched.
        if (handoff.isHandoffBody(pollResponse)) {
          try {
            const entry = await handoff.resolveHandoff(pollResponse, this._authFlowKey);
            pollResponse.apiEndpoint = entry.apiEndpoint;
            pollResponse.token = entry.token;
            pollResponse.username = entry.username;
            delete pollResponse.handoff;
          } catch (e) {
            // @ts-ignore - this is bound via .call()
            if (this._authFlowId !== flowId) return;
            // @ts-ignore - this is bound via .call()
            const previous = this._switchPrevious;
            // @ts-ignore - this is bound via .call()
            this._switchPrevious = null;
            this.state = previous ?? { status: AuthStates.ERROR, message: 'Credential hand-off failed', error: e };
            return;
          }
          // a newer request, a sign-out or a re-initialization replaced this one
          // @ts-ignore - this is bound via .call()
          if (this._authFlowId !== flowId) return;
        }
        // Carry the key forward — listeners on the narrow public surface
        // need it, and the server doesn't echo it back on ACCEPTED.
        if (this._authFlowKey != null && pollResponse.key == null) {
          pollResponse.key = this._authFlowKey;
        }
        const previous = this._switchPrevious;
        this._switchPrevious = null;
        if (pollResponse.status === AuthStates.AUTHORIZED) {
          pollResponse.profile = ProfileStore.fromAccepted(pollResponse);
        } else if (previous != null) {
          // an account switch that did not complete: stay on the previous account
          this.state = previous;
          return;
        }
        this.state = pollResponse;
      }

      async function pollAccess (pollUrl) {
        try {
          const { response, body } = await utils.fetchGet(pollUrl);
          if (response.status === 403 && body?.status === 'REFUSED') {
            return { status: AuthStates.INITIALIZED };
          }
          return body;
        } catch (e) {
          return { status: AuthStates.ERROR, message: 'Error while polling for auth request', error: e };
        }
      }
    }
  }

  // -------------- state listeners ---------------------
  set state (newState) {
    // retro-compatibility for lib-js < 2.0.9
    newState.id = newState.status;

    this._state = newState;

    // Dispatch the state that was just set (`newState`), NOT the live `this.state`
    // getter: a listener that synchronously changes the state mid-dispatch (e.g. a
    // custom listener re-initializing to INITIALIZED on SIGNOUT; the LoginButton's
    // own re-init now starts a microtask later) would otherwise overwrite
    // `this._state`, so later listeners in this loop would receive the wrong state
    // (a logout would deliver INITIALIZED instead of SIGNOUT to the app's
    // onStateChange).
    this.stateChangeListeners.forEach((listener) => {
      try {
        listener(newState);
      } catch (e) {
        console.log('Error during set state ()', e);
      }
    });
  }

  get state () {
    return this._state;
  }
}

// ----------- private methods -------------

/**
 * Narrow the state passed to *external* `onStateChange` callers so the
 * calling app sees only `{ status, id, key, serviceInfo? }` on the
 * terminal AUTHORIZED state reached through the auth-flow polling path.
 * `username` / `token` / `apiEndpoint` are kept inside the lib; the
 * calling app uses `pryv.connectFromKey(key, serviceInfoUrl)` to obtain
 * a `Connection`.
 *
 * The cookie-autologin path (no fresh `key` available, restored from
 * `LoginButton.getAuthorizationData()`) passes through unchanged so
 * existing pages that build a `Connection` directly from the restored
 * state on page load keep working.
 *
 * Non-AUTHORIZED states pass through unchanged so error messages /
 * loading flags / etc. still reach the listener.
 *
 * @param {Object} state - full internal state
 * @returns {Object} narrowed state
 */
function filterForExternalListener (state) {
  if (state == null || state.status !== AuthStates.AUTHORIZED) {
    return state;
  }
  // No key → cookie-autologin path; preserve existing shape.
  if (state.key == null) {
    return state;
  }
  const out = { status: state.status, id: state.id, key: state.key };
  if (state.serviceInfo != null) out.serviceInfo = state.serviceInfo;
  return out;
}

/**
 * The account app is served next to the auth page: strip a trailing `/auth`
 * path segment (and the query) from the auth page URL. Null when the URL
 * does not have that shape.
 * @param {string} [authUrl]
 * @returns {string|null}
 */
function accountUrlFromAuthUrl (authUrl) {
  if (typeof authUrl !== 'string') return null;
  let url;
  try { url = new URL(authUrl); } catch (e) { return null; }
  const path = url.pathname.replace(/\/+$/, '');
  if (!path.endsWith('/auth')) return null;
  return url.origin + path.slice(0, -'/auth'.length);
}

async function checkAutoLogin (authController) {
  const loginButton = authController.loginButton;
  if (loginButton == null) {
    return;
  }

  const storedCredentials = await loginButton.getAuthorizationData();
  if (storedCredentials == null) return;
  if (typeof storedCredentials.authUrl === 'string') authController._authUrl = storedCredentials.authUrl;
  if (Array.isArray(storedCredentials.profiles)) {
    // Several remembered accounts: sign in to the active one, if any
    const store = ProfileStore.read(storedCredentials);
    if (store.active == null) return;
    const state = { status: AuthStates.AUTHORIZED, username: store.active.username, apiEndpoint: store.active.apiEndpoint, profile: store.active };
    if (store.authUrl != null) state.authUrl = store.authUrl;
    authController.state = state;
    return;
  }
  const state = Object.assign({}, { status: AuthStates.AUTHORIZED }, storedCredentials);
  if (typeof state.username === 'string' && typeof state.apiEndpoint === 'string') state.profile = ProfileStore.profileOf(state);
  authController.state = state;
}

/** A stored profile refreshed with what its access says about itself. */
function profileFromAccessInfo (stored, info) {
  const profile = { username: stored.username, apiEndpoint: stored.apiEndpoint };
  const d = info.delegation;
  if (d != null && d.isDelegatedAccess === true && typeof d.delegate?.username === 'string') {
    profile.actingAs = { username: stored.username, delegate: d.delegate.username };
  }
  return profile;
}

/** API errors that mean a stored access is no longer usable. */
const ACCESS_GONE_ERRORS = ['invalid-access-token', 'forbidden'];

/**
 * The signed-in state to return to when an account switch does not
 * complete: the account as stored, without the `key` of its sign-in (that
 * auth request is consumed), like a sign-in from stored credentials.
 */
function restorableState (state) {
  if (state?.status !== AuthStates.AUTHORIZED) return null;
  const restored = { status: AuthStates.AUTHORIZED, username: state.username, apiEndpoint: state.apiEndpoint };
  if (state.profile != null) restored.profile = state.profile;
  if (state.authUrl != null) restored.authUrl = state.authUrl;
  return restored;
}

/** Stop any auth request in progress: its poll no longer changes the state. */
function cancelAuthFlow (authController) {
  authController._authFlowId = (authController._authFlowId || 0) + 1;
  authController._switchPrevious = null;
}

// ------------------ ACTIONS  ----------- //

async function loadAssets (authController) {
  let loadedAssets = {};
  try {
    loadedAssets = await authController.service.assets();
    if (typeof location !== 'undefined') {
      await loadedAssets.loginButtonLoadCSS();
      const thisMessages = await loadedAssets.loginButtonGetMessages();
      if (thisMessages.LOADING) {
        authController.messages = Messages(authController.languageCode, thisMessages);
      } else {
        console.log('WARNING Messages cannot be loaded using defaults: ', thisMessages);
      }
    }
  } catch (e) {
    authController.state = {
      status: AuthStates.ERROR,
      message: 'Cannot fetch button visuals',
      error: e
    };
    throw e; // forward error
  }
  return loadedAssets;
}

module.exports = AuthController;
