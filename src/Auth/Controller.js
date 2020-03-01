const utils = require('../utils');
const Service = require('../Service');
const LoginButton = require('./LoginButton');
const LoginButtonMessages = require('./LoginButtonMessages')('en');
const States = require('./States');
const Cookies = require('./CookieUtils');

const COOKIE_STRING = 'pryv-local-auth';

/**
 * @private
 */
class Controller {

  constructor(settings) {
    this.stateChangeListners = [];
    this.settings = settings;

    if (!settings) { throw new Error('settings cannot be null'); }

    // -- First of all get the button 
    if (this.settings.spanButtonID) {
      this.loginButton = new LoginButton(this);
      this.stateChangeListners.push(this.loginButton.onStateChange.bind(this.loginButton));
    } else {
      if (document) {
        console.log('WARNING: Pryv.Auth initialized with no spanButtonID');
      }
    }

    try { // Wrap all in a large try catch 
      // -- Check Error CallBack
      if (!this.settings.onStateChange) { throw new Error('Missing settings.onStateChange'); }
      this.stateChangeListners.push(this.settings.onStateChange);

      // -- settings 
      if (!this.settings.authRequest) { throw new Error('Missing settings.authRequest'); }
      if (!this.settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      if (!this.settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }

      // -- Extract service info from URL query params if nor specified -- //
      if (!this.settings.serviceInfoUrl) {
        // TODO
      }
    } catch (e) {
      this.state = {
        id: States.ERROR, message: 'During initialization', error: e
      }
      throw (e);
    }
  }

  /**
   * @returns {PryvService}
   */
  async init() {
    this.state = { id: States.LOADING };
    if (this.pryvService) {
      throw new Error('Auth service already initialized');
    }

    // 1. fetch service-info
    this.pryvService = new Service(this.settings.serviceInfoUrl);

    try {
      this.pryvServiceInfo = await this.pryvService.info();
    } catch (e) {
      this.state = {
        id: States.ERROR,
        message: 'Cannot fetch service/info',
        error: e
      }
      throw e; // forward error
    }


    // 3. check autologin 
    let loginCookie = null;
    try {
      loginCookie = Cookies.get(COOKIE_STRING);
    } catch (e) { console.log(e); }

    if (loginCookie) {
      this.state = {
        id: States.AUTHORIZED,
        apiEndpoint: loginCookie.apiEndpoint,
        displayName: loginCookie.displayName,
        action: this.logOut
      };
    } else {
      // 4. Propose Login
      this.readyAndClean();
    }

    return this.pryvService;
  }

  /**
   * Called at the end init() and when logging out()
   */
  readyAndClean() {
    Cookies.del(COOKIE_STRING)
    this.accessData = null;
    this.state = {
      id: States.INITIALIZED,
      serviceInfo: this.serviceInfo,
      action: this.openLoginPage
    }
  }

  // ----------------------- ACCESS --------------- ///


  /**
   * @private
   */
  async postAccess() {
    const res = await utils.superagent.post(this.pryvServiceInfo.access)
      .set('accept', 'json')
      .send(this.settings.authRequest);
    return res.body;
  }

  /**
  * @private
  */
  async getAccess() {
    const res = await utils.superagent.get(this.accessData.poll).set('accept', 'json');
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
    this.polling = true;
    this.processAccess(await this.getAccess());
    setTimeout(this.poll.bind(this), this.accessData.poll_rate_ms);
  }



  /**
   * @private 
   */
  processAccess(accessData) {
    console.log('_processAccess :', accessData);
    if (!accessData || !accessData.status) {
      this.state = {
        id: States.ERROR,
        message: 'Invalid Access data response',
        error: new Error('Invalid Access data response')
      };
      throw this.state.error;
    }
    this.accessData = accessData;

    switch (this.accessData.status) {
      case 'ERROR':
        this.state = {
          id: States.ERROR,
          message: 'Error on the backend'
        };
        break;
      case 'ACCEPTED':
        const apiEndpoint =
          Service.buildAPIEndpoint(this.pryvServiceInfo, this.accessData.username, this.accessData.token);

        Cookies.set(COOKIE_STRING, { apiEndpoint: apiEndpoint, displayName: this.accessData.username });

        this.state = {
          id: States.AUTHORIZED,
          apiEndpoint: apiEndpoint,
          displayName: this.accessData.username,
          action: this.logOut
        };

        break;
    }
  }


  // ---------------------- STATES ----------------- //

  set state(newState) {
    console.log('State Changed:' + JSON.stringify(newState));
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
   * Follow Auth Process and 
   * Open Login Page.
   */
  async openLoginPage() {
    console.log('OpenLogin', this);
    // 1. Make sure Auth is initialized
    if (!this.pryvServiceInfo) {
      throw new Error('Auth service must be initialized first');
    }

    // 2. Post access if needed
    if (!this.accessData) {
      this.processAccess(await this.postAccess());
    }

    // 3.a Open Popup (even if already opened)
    if (this.accessData.status === 'NEED_SIGNIN')
      window.open(this.accessData.url, "PryvLogin");

    // 3.a.1 Poll Access if not yet in course
    if (!this.polling) this.poll();
  }

  /**
   * Revoke Connection and clean local cookies
   * 
   */
  logOut() {
    if (confirm(LoginButtonMessages.LOGOUT_CONFIRM)) {
      this.readyAndClean();
    }
  }

}



module.exports = Controller;