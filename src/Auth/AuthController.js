const utils = require('../utils'); 
const Service = require('../Service');
const LoginButton = require('../Browser/LoginButton');
const AuthStates = require('./AuthStates');

/**
 * @private
 */
class AuthController {


  constructor(settings, serviceInfoUrl, serviceCustomizations, HumanInteraction) {
    this.stateChangeListners = [];
    this.settings = settings;
    this.serviceInfoUrl = serviceInfoUrl;
    this.serviceCustomizations = serviceCustomizations;
    this.humanInteraction = new HumanInteraction(this);
    

    if (!settings) { throw new Error('settings cannot be null'); }

    // -- Register Human Interactions to stateListener
    this.stateChangeListners.push(this.humanInteraction.onStateChange.bind(this.humanInteraction));

    try { // Wrap all in a large try catch 
      

      // -- Check Error CallBack
      if (!this.settings.onStateChange) { throw new Error('Missing settings.onStateChange'); }
      this.stateChangeListners.push(this.settings.onStateChange);

      // -- settings 
      if (!this.settings.authRequest) { throw new Error('Missing settings.authRequest'); }

      // -- Extract returnURL 
      this.settings.authRequest.returnURL = 
        AuthController.getReturnURL(this.settings.authRequest.returnURL);

      if (!this.settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      this.cookieKey = COOKIE_STRING + this.settings.authRequest.requestingAppId;

      if (!this.settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }

    } catch (e) {
      this.state = {
        id: AuthStates.ERROR, message: 'During initialization', error: e
      }
      throw (e);
    }
  }

  /**
   * @returns {PryvService}
   */
  async init() {
    this.state = { id: AuthStates.LOADING };
    if (this.pryvService) {
      throw new Error('Browser service already initialized');
    }

 
    // 1. fetch service-info
    this.pryvService = new Service(this.serviceInfoUrl, this.serviceCustomizations);

    try {
      this.pryvServiceInfo = await this.pryvService.info();
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Cannot fetch service/info',
        error: e
      }
      throw e; // forward error
    }

    // 2. Init humanInteraction Module
    await this.humanInteraction.init();

    // 3. Check if there is a prYvkey as result of "out of page login"
    let pollUrl = await this.humanInteraction.pollUrlReturningFromLogin();
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
      return this.pryvService;
    }

    // 4. check autologin 
    let loginCookie = null;
    try {
      loginCookie = Cookies.get(this.cookieKey);
    } catch (e) { console.log(e); }

    if (loginCookie) { 
      this.state = {
        id: AuthStates.AUTHORIZED,
        apiEndpoint: loginCookie.apiEndpoint,
        displayName: loginCookie.displayName,
        action: this.logOut
      };
    } else {
      // 5. Propose Login
      this.readyAndClean();
    }

    return this.pryvService;
  }

  /**
   * Called at the end init() and when logging out()
   */
  readyAndClean() {
    Cookies.del(this.cookieKey)
    this.accessData = null;
    this.state = {
      id: AuthStates.INITIALIZED,
      serviceInfo: this.serviceInfo,
      action: this.openLoginPage
    }
  }

  // ----------------------- ACCESS --------------- ///


  /**
   * @private
   */
  async postAccess() {
    try {
      const res = await utils.superagent.post(this.pryvServiceInfo.access)
        .set('accept', 'json')
        .send(this.settings.authRequest);
      return res.body;
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Requesting access',
        error: e
      }
      throw e; // forward error
    }
  }

  /**
  * @private
  */
  async getAccess() {
    let res;
    try {
      res = await utils.superagent.get(this.accessData.poll).set('accept', 'json');
    }
    catch (e) {
      return { "status": "ERROR" }
    }
    return res.body;
  }

  /**
   * @private 
   */
  async poll() {
    if (this.accessData.status !== 'NEED_SIGNIN') {
      this.polling = false;
      return;
    }
    if (this.settings.authRequest.returnURL) { // no popup
      return;
    }
    this.polling = true;
    this.processAccess(await this.getAccess());
    setTimeout(this.poll.bind(this), this.accessData.poll_rate_ms);
  }



  /**
   * @private 
   */
  processAccess(accessData) {
    if (!accessData || !accessData.status) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Invalid Access data response',
        error: new Error('Invalid Access data response')
      };
      throw this.state.error;
    }
    this.accessData = accessData;
    switch (this.accessData.status) {
      case 'ERROR':
        this.state = {
          id: AuthStates.ERROR,
          message: 'Error on the backend, please refresh'
        };
        break;
      case 'ACCEPTED':
        const apiEndpoint =
          Service.buildAPIEndpoint(this.pryvServiceInfo, this.accessData.username, this.accessData.token);

        Cookies.set(this.cookieKey, 
          { apiEndpoint: apiEndpoint, displayName: this.accessData.username });

        this.state = {
          id: AuthStates.AUTHORIZED,
          apiEndpoint: apiEndpoint,
          displayName: this.accessData.username,
          action: this.logOut
        };

        break;
    }
  }


  // ---------------------- STATES ----------------- //

  set state(newState) {
    //console.log('State Changed:' + JSON.stringify(newState));
    this._state = newState;

    this.stateChangeListners.map((listner) => {
      try { listner(this.state) } catch (e) { console.log(e); }
    });
  }

  get state() {
    return this._state;
  }


  // ------------------ ACTIONS  ----------- //

  /**
   * Follow Browser Process and 
   * Open Login Page.
   */
  async openLoginPage() {
    console.log('OpenLogin', this);
    // 1. Make sure Browser is initialized
    if (!this.pryvServiceInfo) {
      throw new Error('Browser service must be initialized first');
    }

    // 2. Post access if needed
    if (!this.accessData) {
      this.processAccess(await this.postAccess());
    }

    // 3.a Open Popup (even if already opened)
    if (this.accessData.status === 'NEED_SIGNIN')
      this.popupLogin();

    // 3.a.1 Poll Access if not yet in course
    if (!this.polling) this.poll();
  }

  /**
   * Revoke Connection and clean local cookies
   * 
   */
  logOut() {
    const message = this.loginButton ? this.loginButton.myMessages.LOGOUT_CONFIRM : 'Logout ?';
    if (confirm(message)) {
      this.readyAndClean();
    }
  }

  popupLogin() {
    if (!this.accessData || !this.accessData.url) {
      throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
    }

    if (this.settings.authRequest.returnURL) { // open on same page (no Popup) 
      location.href = this.accessData.url;
      return;
    }

    var screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft,
      screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop,
      outerWidth = typeof window.outerWidth !== 'undefined' ?
        window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight !== 'undefined' ?
        window.outerHeight : (document.body.clientHeight - 22),
      width = 320,
      height = 510,
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
    const authUrl = this.accessData.authUrl || this.accessData.url;

    this.popup = window.open(authUrl, 'prYv Sign-in', features);

    if (!this.popup) {
      // TODO try to fall back on access
      console.log('FAILED_TO_OPEN_WINDOW');
    } else if (window.focus) {
      this.popup.focus();
    }

    return;
  }

 
}

module.exports = AuthController;
