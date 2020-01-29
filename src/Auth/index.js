const Controller = require('./Controller');
const States = require('./States');

/**
 * @module Auth 
 * @memberof Pryv
 */


/**
 * Start an authentication process
 * @memberof Pryv.Auth
 * @param {Object} settings
 * @param {string} settings.serviceInfoUrl
 * @param {Object} settings.authRequest See https://api.pryv.com/reference/#data-structure-access
 * @param {string} settings.authRequest.requestingAppId Application id, ex: 'my-app'
 * @param {Object} settings.authRequest.requestedPermissions
 * @param {string | boolean} settings.authRequest.returnURL : false, // set this if you don't want a popup
 * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
 * @param {module:Auth.AuthStateChangeHandler} settings.onStateChange
 * @returns {PryvServiceInfo}
 */
async function setup(settings) {
  return (new Controller(settings)).init();
}


module.exports = {
  setup: setup,
  States: States
}



/**
 * Notify the requesting code of all important changes
 * - ERROR => {message: <string>, error: <error>}
 * - LOADING => {}
 * - INITIALIZED => {serviceInfo: <PryvServiceInfo>, action: <Open Popup Function>}
 * - AUTHORIZED => {apiEndPoint: <PryvApiEndpoint>, serviceInfo: <PryvServiceInfo>, displayName: <string> action: <Open Logout Question>}
 * - LOGOUT => {}
 * @callback AuthStateChangeHandler
 * @param {Object} state
 * @param {Pryv.Auth.AuthState} state.id  one of ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 */
