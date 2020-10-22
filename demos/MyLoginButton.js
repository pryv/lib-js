const HumanInteractionInterface = require('../Auth/HumanInteractionInterface');
const utils = require('../utils'); 
const AuthStates = require('../Auth/AuthStates');

/**
 * @memberof Pryv.Browser
 */
class MyLoginButton extends HumanInteractionInterface {

  /**
   * @param {Browser/AuthController} auth 
   */
  
  constructor (authController) {
    super(authController);
  }
   
  /**
   * setup button and load assets
   */
  async init () {
    this.auth.stateChangeListners.push(this.onStateChange.bind(this));
    this.setupButton();
    await this.loadAssets();
    /*
      // 3. Check if there is a prYvkey as result of "out of page login"
      let pollUrl = await this.pollUrlReturningFromLogin();
      if (pollUrl !== null) {
        try {
          const res = await utils.superagent.get(pollUrl);
          this.processAccess(res.body);
        } catch (e) {
          this.state = {
            id: AuthStates.ERROR,
            message: 'Cannot fetch result',
            error: e
          }
        }
    */
  }
  
  setupButton () {
    this.loginButtonSpan = document.getElementById(this.auth.settings.spanButtonID);

    if (!this.loginButtonSpan) {
      console.log('WARNING: Pryv.Browser initialized with no spanButtonID');
    }

    // up to the time the button is loaded use the Span to display eventual error messages
    this.loginButtonText = this.loginButtonSpan;

    // bind actions dynamically to the button click
    this.loginButtonSpan.addEventListener('click', this.onClick.bind(this));
  }

  /**
   * Optional - sets the button with the style from the 
   * service info
   */
  async loadAssets () {
    const assets = await this.auth.loadAssets();
    this.loginButtonSpan.innerHTML = await assets.loginButtonGetHTML();
    this.loginButtonText = document.getElementById('pryv-access-btn-text');
    // State was not changed, only the button text, so reload state manually
    this.onStateChange();
  }

  /**
   * The same button can redirect, open auth popup or logout
   */
  onClick () {
    if (this.auth.state.id === AuthStates.AUTHORIZED) {
      this.auth.logOut();
    } else if (this.auth.state.id === AuthStates.INITIALIZED) {
      this.startLoginScreen();
    }
  }

  /**
   * Eventually return pollUrl when returning from login in another page
   * TODO IEVA - what situation this one is handling?
   */
  async pollUrlReturningFromLogin () {
    const params = utils.getQueryParamsFromURL(window.location.href);
    let pollUrl = null;
    if (params.prYvkey) { // deprecated method - To be removed
      pollUrl = this.pryvServiceInfo.access + params.prYvkey;
    }
    if (params.prYvpoll) {
      pollUrl = params.prYvpoll;
    }
    return pollUrl;
  }

  onStateChange () {
    this.text = this.auth.defaultOnStateChange();
    if (this.loginButtonText) {
      this.loginButtonText.innerHTML = this.text;
    }
  }

  startLoginScreen () {
    // Poll Access if not yet in course
    if (!this.auth.polling) this.auth.poll();

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

    // Keep "url" for retro-compatibility for Pryv.io before v1.0.4 
    const authUrl = this.auth.accessData.authUrl || this.auth.accessData.url;

    this.popup = window.open(authUrl, 'prYv Sign-in', features);

    if (!this.popup) {
      this.auth.polling = false;
      console.log('FAILED_TO_OPEN_WINDOW');
    } else if (window.focus) {
      this.popup.focus();
    }
  }
}
module.exports = LoginButton;