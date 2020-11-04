const Cookies = require('./CookieUtils');
const AuthStates = require('../Auth/AuthStates');
const AuthController = require('../Auth/AuthController');
const Service = require('../Service');
const Messages = require('../Auth/LoginMessages');
const utils = require('../utils');

/**
 * @memberof Pryv.Browser
 */
class LoginButton {

  constructor(authSettings, service) {
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
    if (this.loginButtonText) {
      await loadAssets(this);
    }
    // set cookie key for authorization data
    this._cookieKey = 'pryv-libjs-' + this.authSettings.authRequest.requestingAppId;
    
    // initialize controller
    if (this.auth) { return this.auth; }
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
      case AuthStates.NEED_SIGNIN:
        const loginUrl = state.authUrl || state.url; // url is deprecated
        if (this.authSettings.authRequest.returnURL) { // open on same page (no Popup) 
          location.href = loginUrl; 
          return;
        } else {
          startLoginScreen(this, loginUrl);
        }
        break;
      case AuthStates.AUTHORIZED:
        this.text = state.username;
        this.saveAuthorizationData({
          apiEndpoint: state.apiEndpoint,
          username: state.username
        });
        break;
      case AuthStates.LOGOUT:
        const message = this.messages.LOGOUT_CONFIRM ? this.messages.LOGOUT_CONFIRM : 'Logout ?';
        if (confirm(message)) {
          this.deleteAuthorizationData();
          this.auth.init();
        }
        break;
      case AuthStates.ERROR:
        this.text = getErrorMessage(this, state.message);
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + state.status);
    }
    if (this.loginButtonText) {
      this.loginButtonText.innerHTML = this.text;
    }
  }

  getAuthorizationData () {
    return Cookies.get(this._cookieKey);
  }

  saveAuthorizationData (authData) {
    Cookies.set(this._cookieKey,authData);
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

    // 3. Check if there is a prYvkey as result of "out of page login"
    const url = window.location.href;
    let pollUrl = retrievePollUrl(url);
    if (pollUrl !== null) {
      try {
        const res = await utils.superagent.get(pollUrl);
        authController.state = res.body;
      } catch (e) {
        authController.state = {
          status: AuthStates.ERROR,
          message: 'Cannot fetch result',
          error: e
        };
      }
    }

    function retrievePollUrl (url) {
      const params = utils.getQueryParamsFromURL(url);
      let pollUrl = null;
      if (params.prYvkey) { // deprecated method - To be removed
        pollUrl = authController.serviceInfo.access + params.prYvkey;
      }
      if (params.prYvpoll) {
        pollUrl = params.prYvpoll;
      }
      return pollUrl;
    }
  }
}

async function startLoginScreen (loginButton, authUrl) {
  let screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft,
    screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop,
    outerWidth = typeof window.outerWidth !== 'undefined' ?
      window.outerWidth : document.body.clientWidth,
    outerHeight = typeof window.outerHeight !== 'undefined' ?
      window.outerHeight : (document.body.clientHeight - 22),
    width = 400,
    height = 620,
    left = parseInt(screenX + ((outerWidth - width) / 2), 10),
    top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
    features = (
      'width=' + width +
      ',height=' + height +
      ',left=' + left +
      ',top=' + top +
      ',scrollbars=yes'
    );
    loginButton.popup = window.open(authUrl, 'prYv Sign-in', features);
  
  if (!loginButton.popup) {
    loginButton.auth.stopAuthRequest('FAILED_TO_OPEN_WINDOW');
  } else if (window.focus) {
    loginButton.popup.focus();
  }
}

function setupButton(loginBtn) {
  loginBtn.loginButtonSpan = document.getElementById(loginBtn.authSettings.spanButtonID);

  if (!loginBtn.loginButtonSpan) {
    console.log('WARNING: Pryv.Browser initialized with no spanButtonID');
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
async function loadAssets(loginBtn) {
  const assets = await loginBtn.service.assets();
  loginBtn.loginButtonSpan.innerHTML = await assets.loginButtonGetHTML();
  loginBtn.loginButtonText = document.getElementById('pryv-access-btn-text');
}
module.exports = LoginButton;

function getErrorMessage (loginButton, message) {
  return loginButton.messages.ERROR + ': ' + message;
}

function getLoadingMessage (loginButton) {
  return loginButton.messages.LOADING;
}

function getInitializedMessage (loginButton, serviceName) {
  return loginButton.messages.LOGIN + ': ' + serviceName;
}
