const utils = require('./utils.js');

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
   * @param {string} settings.requestingAppId Application id, ex: 'my-app'
   * @param {Object} settings.requestedPermissions See http://api.pryv.com/reference/#data-structure-access
   * @param {string | boolean} settings.returnURL : false, // set this if you don't want a popup
   * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
   * @param {Object} settings.callbacks
   * @param {Object} settings.callbacks.accepted : function(apiEndPoint)
   * @param {Object} settings.callbacks.refused: function(reason)
   * @param {Object?} settings.callbacks.error: Optional function(code, message) 
   */
  constructor(settings) {
    this.settings = settings;
    if (! settings) { throw new Error('settings cannot be null'); }
    if (! settings.requestingAppId) { throw new Error('Missing settings.requestingAppId'); }
    if (! settings.requestedPermissions) { throw new Error('Missing settings.requestedPermissions'); }
    if (! settings.callbacks) { throw new Error('Missing settings.callbacks'); }
    if (! settings.callbacks.accepted) { throw new Error('Missing settings.callbacks.accepted'); }
    if (! settings.callbacks.refused) { throw new Error('Missing settings.callbacks.refused'); }

    // -- Set default Error handling if not specified -- //
    if (! settings.callbacks.error) { 
      settings.callbacks.error = function(code, message) {
        const text = 'Error code: ' + code + ' => ' + message;
        console.error(text);
        throw new Error(text)
      }
    };

    // -- Extract service info from URL query params if nor specified -- //
    if (! settings.serviceInfoUrl) {
     // TODO
    }
    

    // 1. fetch service-info

    // 2. Post access
    // 3.a Open Popup
    // 3.a.1 Poll Access
    // 3.b Open url 
  }

}

module.exports = Auth;