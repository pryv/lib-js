const utils = require('../utils');
const Service = require('../Service');
const LoginButton = require('./LoginButton');

const States = require('./States');

/**
 * @class Auth
 * @memberof Pryv
 */
class Auth {

  /** 
   * Setup method to ne backward compatible with Pryv v1.
   * Equivalent to new Auth(settings)
   * @returns {Auth}
   */
  static setup(settings) { return new Auth(settings); }

  /**
   * @param {Object} settings 
   * @param {string} settings.serviceInfoUrl
   * @param {Object} settings.accessRequest See https://api.pryv.com/reference/#data-structure-access
   * @param {string} settings.accessRequest.requestingAppId Application id, ex: 'my-app'
   * @param {Object} settings.accessRequest.requestedPermissions 
   * @param {string | boolean} settings.accessRequest.returnURL : false, // set this if you don't want a popup
   * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
   * @param {StateChangeHandler} settings.onStateChange
   */
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
      if (! this.settings.onStateChange) { throw new Error('Missing settings.onStateChange'); }
      this.stateChangeListners.push(this.settings.onStateChange);

      // -- settings 
      if (!this.settings.accessRequest) { throw new Error('Missing settings.accessRequest'); }
      if (!this.settings.accessRequest.requestingAppId) {
        throw new Error('Missing settings.accessRequest.requestingAppId');
      }
      if (!this.settings.accessRequest.requestedPermissions) {
        throw new Error('Missing settings.accessRequest.requestedPermissions');
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
    this.init();
  }

  /**
   * @private
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


    // 4. Propose Login
    this.state = {
      id: States.INITIALIZED,
      serviceInfo: this.serviceInfo,
      action: this.openLoginPage
    }
  }

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
    if (! this.accessData) {
      this._processAccess(await this._postAccess());
    }

    // 3.a Open Popup (even if already opened)
    if (this.accessData.status === 'NEED_SIGNIN')
      window.open(this.accessData.url, "PryvLogin");

    // 3.a.1 Poll Access if not yet in course
    if (!this.polling) this._poll();
  }

  /**
   * Revoke Connection and clean local cookies
   * 
   */
  async logOut() {
    
  }

  /**
   * @private
   */
  async _postAccess() {
    const res = await utils.superagent.post(this.pryvServiceInfo.access)
      .set('accept', 'json')
      .send(this.settings.accessRequest);
    return res.body;
  }

  /**
  * @private
  */
  async _getAccess() {
    const res = await utils.superagent.get(this.accessData.poll).set('accept', 'json');
    return res.body;
  }

  /**
   * @private 
   */
  _processAccess(accessData) {
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

        this.state = {
          id: States.AUTHORIZED,
          apiEndpoint: apiEndpoint,
          displayName: this.accessData.username
        };
        
        break;
    }
  }

  /**
   * @private 
   */
  async _poll() {
    if (this.accessData.status !== 'NEED_SIGNIN') {
      this.polling = false;
      return;
    }
    this.polling = true;
    this._processAccess(await this._getAccess());
    setTimeout(this._poll.bind(this), this.accessData.poll_rate_ms);
  }

  set state(newState) {
    console.log('State Changed:' + JSON.stringify(newState));
    this._state = newState;

    this.stateChangeListners.map((listner) => { 
      try { listner(this._state)} catch (e) { console.log(e); } });
  }

  get state() {
    return this._state;
  }

  /**
   * @return {AuthState}
   */
  static get States() {
    return States;
  }

}

/**
 * Notify the requesting code of all important changes  
 * - ERROR => {message: <string>, error: <error>}  
 * - LOADING => {}  
 * - INITIALIZED => {serviceInfo: <PryvServiceInfo>, action: <Open Popup Function>}  
 * - AUTHORIZED => {apiEndPoint: <PryvApiEndpoint>, serviceInfo: <PryvServiceInfo>, displayName: <string> action: <Open Logout Question>}
 * - LOGOUT => {}
 * @callback StateChangeHandler
 * @memberof Pryv.Auth
 * @param {Object} state
 * @param {AuthState} state.id  one of ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 */


module.exports = Auth;