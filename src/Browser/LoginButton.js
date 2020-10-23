const HumanInteractionInterface = require('../Auth/HumanInteractionInterface');
const Cookies = require('./CookieUtils');

/**
 * @memberof Pryv.Browser
 */
class LoginButton extends HumanInteractionInterface {
   
  /**
   * setup button and load assets
   */
  async init () {
    this.auth.stateChangeListners.push(this.onStateChange.bind(this));
    setupButton(this);
    if (this.loginButtonText) {
      await loadAssets(this);
    }
    this._cookieKey = 'pryv-libjs-' + this.auth.settings.authRequest.requestingAppId;
  }

  /**
   * The same button can redirect, open auth popup or logout
   */
  onClick () {
    this.auth.handleClick();
  }

  onStateChange () {
    this.text = this.auth.getButtonText();
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
}

function setupButton(loginBtn) {
  loginBtn.loginButtonSpan = document.getElementById(loginBtn.auth.settings.spanButtonID);

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
  loginBtn.loginButtonSpan.innerHTML = await loginBtn.auth.getAssets().loginButtonGetHTML();
  loginBtn.loginButtonText = document.getElementById('pryv-access-btn-text');
}
module.exports = LoginButton;