const utils = require('./utils');
const Service = require('./Service');

/**
 * @class Auth
 */
class Auth {

  /** 
   * Setup method to ne backward compatible with Pryv v1.
   * Equivalent to new Auth(settings)
   * @returns {Auth}
   */
  static setup(setting) { return new Auth(settings); }

  /**
   * @param {Object} settings 
   * @param {string} settings.serviceInfoUrl
   * @param {Object} settings.accessRequest See http://api.pryv.com/reference/#data-structure-access
   * @param {string} settings.accessRequest.requestingAppId Application id, ex: 'my-app'
   * @param {Object} settings.accessRequest.requestedPermissions 
   * @param {string | boolean} settings.accessRequest.returnURL : false, // set this if you don't want a popup
   * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
   * @param {Object} settings.callbacks
   * @param {Function} settings.callbacks.accepted : function(apiEndPoint)
   * @param {Function} settings.callbacks.refused: function(reason)
   * @param {Function?} settings.callbacks.error: Optional function(code, message)
   * @param {Function?} settings.callbacks.serviceInfo: Optional function(code, s)
   */
  constructor(settings) {
    this.settings = settings;
    if (! settings) { throw new Error('settings cannot be null'); }
    if (! settings.accessRequest) { throw new Error('Missing settings.accessRequest'); }
    if (! settings.accessRequest.requestingAppId) { 
        throw new Error('Missing settings.accessRequest.requestingAppId'); }
    if (! settings.accessRequest.requestedPermissions) { 
      throw new Error('Missing settings.accessRequest.requestedPermissions'); }
    if (! settings.on) { throw new Error('Missing settings.on Event listner'); }

    // -- Extract service info from URL query params if nor specified -- //
    if (! settings.serviceInfoUrl) {
     // TODO
    }
  }

  /**
   * @private
   */
  async init() {
    if (this.pryvService) {
      throw new Error('Auth service already initialized');
    }
    // 1. fetch service-info
    this.pryvService = new Service(this.settings.serviceInfoUrl);
    /**
     * @property {PryvServiceInfo}
     */
    this.pryvServiceInfo = await this.pryvService.info();

    // 2. build button

    // 3. check autologin 

  }

  /**
   * Follow Auth Process and 
   * Open Login Page.
   */
  async openLoginPage() { 
    // 1. Make sure Auth is initialized
    if (!this.pryvServiceInfo) {
      throw new Error('Auth service must be initialized first');
    }
    // 2. Post access
    const accessResult = await this._postAccess();

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


}

Auth.MESSAGE_ERROR = 'error';
Auth.MESSAGE_AUTHORIZED = 'loggedIn';
Auth.MESSAGE_REFUSED = 'refused';
Auth.MESSAGE_OPENURL = 'openURL';

module.exports = Auth;