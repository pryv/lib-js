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
   * @param {Object} settings.callbacks
   * @param {Function} settings.callbacks.signedIn : function(apiEndPoint)
   * @param {Function} settings.callbacks.refused: function(reason)
   * @param {Function?} settings.callbacks.error: Optional function(code, message)
   * @param {Function?} settings.callbacks.serviceInfo: Optional function(code, s)
   */
  constructor(settings) {

    this.settings = settings;

    if (!settings) { throw new Error('settings cannot be null'); }

    // -- First of all get the button 
    if (this.settings.spanButtonID) {
      this.loginButton = new LoginButton(this);
    } else {
      if (document) {
        console.log('WARNING: Pryv.Auth initialized with no spanButtonID');
      }
    }

    try { // Wrap all in a large try catch 
      // -- Check Error CallBack
      if (!this.settings.callbacks) { throw new Error('Missing settings.callbacks'); }

      // -- Set default Error handling if not specified -- //
      if (!this.settings.callbacks.error) {
        this.settings.callbacks.error = function (code, message) {
          const text = 'Error code: ' + code + ' => ' + message;
          console.error(text);
          throw new Error(text)
        }
      };

      // -- settings 
      if (!this.settings.accessRequest) { throw new Error('Missing settings.accessRequest'); }
      if (!this.settings.accessRequest.requestingAppId) {
        throw new Error('Missing settings.accessRequest.requestingAppId');
      }
      if (!this.settings.accessRequest.requestedPermissions) {
        throw new Error('Missing settings.accessRequest.requestedPermissions');
      }

      // -- other callbacks
      if (!this.settings.callbacks.accepted) { throw new Error('Missing settings.callbacks.accepted'); }
      if (!this.settings.callbacks.refused) { throw new Error('Missing settings.callbacks.refused'); }



      // -- Extract service info from URL query params if nor specified -- //
      if (!this.settings.serviceInfoUrl) {
        // TODO
      }
    } catch (e) {
      this.state = {
        id: 'ERROR', message: 'During initialization', details: e
      }
      throw (e);
    }
    this.init();
  }

  /**
   * @private
   */
  async init() {
    this.state = { id: 'INIT', action: null };
    if (this.pryvService) {
      throw new Error('Auth service already initialized');
    }

    // 1. fetch service-info
    this.pryvService = new Service(this.settings.serviceInfoUrl);

    try {
      /**
       * @property {PryvServiceInfo}
       */
      this.pryvServiceInfo = await this.pryvService.info();
    } catch (e) {
      this.state = {
        id: States.ERROR,
        message: 'Cannot fecth service/info',
        error: e
      }
      throw e; // forward error
    }
    
    // 3. check autologin 


    // 4. Propose Login
    this.state = {
      id: States.PROPOSE_LOGIN,
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
    // 2. Post access
    this._processAccess(await this._postAccess());

    // 3.a Open Popup
    // 3.a.1 Poll Access
    // 3.b Open url 
  }

  /**
   * Revoke Connection and clean local cookies
   * 
   */
  async logOut() {
    // 2. Post access
    // 3.a Open Popup
    // 3.a.1 Poll Access
    // 3.b Open url 
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
  _processAccess(accessData) {
    console.log('_processAccess :', accessData);
    if (!accessData || !accessData.status) {
      throw new Error('Invalid Access data response');
    }
    this.accessData = accessData;
    
  }

  /**
   * @private 
   */
  async _poll() {

  }

  set state(newState) {
    console.log('State Changed:' + JSON.stringify(newState));

    this._state = newState;
    try {
      if (this.loginButton) {
        this.loginButton.stateChanged();
      } 
    } catch (e) {
      console.log(e);
      //ignore
    }
    try {
      if (this.callbacks && this.callbacks.stateChanged) {
        this.callbacks.stateChanged();
      }
    } catch (e) {
      console.log(e);
      //ignore
    }

    try {
      switch (this._state.id) {
        case States.ERROR:
          this.settings.callbacks.error({
            message: this._state.message,
            details: this._state.details
          });
          break;
        case States.INIT:
          console.log('INIT');
          // nothing to do
          break;
        case States.PROPOSE_LOGIN:
          // nothing to do
          break;
        default:
          //throw new Error('Unkown state.id: ' + this._state.id);
      }
    } catch (e) {
      console.log(e);
      //ignore
    }

  }

  get state() {
    return this._state;
  }

  static get States() {
    return States;
  }

}

module.exports = Auth;