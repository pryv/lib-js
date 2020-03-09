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
 * @param {Object} settings.authRequest See https://api.pryv.com/reference/#data-structure-access
 * @param {string} [settings.authRequest.languageCode] Language code, as per LoginButton Messages: 'en', 'fr
 * @param {string} settings.authRequest.requestingAppId Application id, ex: 'my-app'
 * @param {Object} settings.authRequest.requestedPermissions
 * @param {string | boolean} settings.authRequest.returnURL : false, // set this if you don't want a popup
 * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
 * @param {Auth.AuthStateChangeHandler} settings.onStateChange
 * @param {string} [settings.returnURL=auto#]  Set to "self#" to disable popup and force using the same page. Set a custom url when process is finished (specific use cases). Should always end by # ? or &
 * @param {string} serviceInfoUrl
 * @param {Object} [serviceCustomizations] override properties of serviceInfoUrl 
 * @returns {PryvServiceInfo}
 */
async function setup(settings, serviceInfoUrl, serviceCustomizations) {
  return (new Controller(settings, 
    serviceInfoUrl, serviceCustomizations)).init();
}


module.exports = {
  setup: setup,
  States: States,
  serviceInfoFromUrl: Controller.getServiceInfoFromURL
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
