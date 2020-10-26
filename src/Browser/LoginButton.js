const HumanInteractionInterface = require('../Auth/HumanInteractionInterface');
const Cookies = require('./CookieUtils');
const AuthStates = require('../Auth/AuthStates');
const AuthController = require('../Auth/AuthController');
const Service = require('../Service');
const Messages = require('../Auth/LoginMessages');

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
    setupButton(this);
    this.languageCode = this.authSettings.authRequest.languageCode || 'en';    
    this.messages = Messages(this.languageCode);
    if (this.loginButtonText) {
      await loadAssets(this);
    }
    this._cookieKey = 'pryv-libjs-' + this.authSettings.authRequest.requestingAppId;
    
    this.initAuthIfNeeded();

    const storedCredentials = await this.getAuthorizationData();
    if (storedCredentials != null) {
      await this.onStateChange(Object.assign({}, {id: AuthStates.AUTHORIZED}, storedCredentials));
    } else {
    }
    return this.service;
  }

  /**
   * The same button can redirect, open auth popup or logout
   */
  onClick () {
    this.auth.handleClick();
  }

  async onStateChange (state) {
    this.text = '';
    switch (state.id) {
      case AuthStates.ERROR:
        this.text = getErrorMessage(this, state.message);
        break;
      case AuthStates.LOADING:
        this.text = getLoadingMessage(this);
        break;
      case AuthStates.INITIALIZED:
        this.text = getInitializedMessage(this, this.serviceInfo.name);
        break;
      case AuthStates.START_SIGNING:
        this.text = getInitializedMessage(this, this.serviceInfo.name);
        if (this.authSettings.authRequest.returnURL) { // open on same page (no Popup) 
          location.href = state.url;
          return;
        } else {
          await this.auth.startAuthRequest();
          if (this.loginButton != null) {
            const loginUrl = state.authUrl || state.url;
            this.startLoginScreen(loginUrl);
          }
        }
        break;
      case AuthStates.AUTHORIZED:
        // if accessData is null it means it is already loaded from the cookie/storage
        this.text = getAuthorizedMessage(state.displayName);
        if (state != null) {
          const apiEndpoint =
            Service.buildAPIEndpoint(
              this.service.infoSync(),
              state.username,
              state.token
            );
          if (this.loginButton != null) {
            this.saveAuthorizationData({
              apiEndpoint: apiEndpoint,
              displayName: state.username
            });
          }
        }
        break;
      case AuthStates.LOGOUT:
        logOut(this);
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + state.id);
    }
    if (this.loginButtonText) {
      this.loginButtonText.innerHTML = this.text;
    }
  }

  async startLoginScreen (authUrl) {
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
    this.popup = window.open(authUrl, 'prYv Sign-in', features);
    
    if (!this.popup) {
      this.auth.stopAuthRequest();
      console.log('FAILED_TO_OPEN_WINDOW');
    } else if (window.focus) {
      this.popup.focus();
    }
  }

  saveAuthorizationData (authData) {
    Cookies.set(this._cookieKey,authData);
  }

  getAuthorizationData () {
    return Cookies.get(this._cookieKey);
  }

  async deleteAuthorizationData () {
    Cookies.del(this._cookieKey);
  }

  async initAuthIfNeeded() {
    if (this.auth) { return this.auth; }
    this.auth = new AuthController(this.authSettings, this.service);
    await this.auth.init();
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
  loginBtn.loginButtonSpan.innerHTML = assets.loginButtonGetHTML();
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

function getAuthorizedMessage (displayName) {
  return displayName;
}