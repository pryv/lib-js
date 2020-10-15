const AuthController = require('../Auth/AuthController');
const AuthStates = require('../Auth/AuthStates');
const LoginButton = require('../Browser/LoginButton');

/**
 * @memberof Pryv
 * @namespace Pryv.Browser
 */


/**
 * Start an authentication process
 * @memberof Pryv.Browser
 * @param {Object} settings
 * @param {Object} settings.authRequest See https://api.pryv.com/reference/#data-structure-access
 * @param {string} [settings.authRequest.languageCode] Language code, as per LoginButton Messages: 'en', 'fr
 * @param {string} settings.authRequest.requestingAppId Application id, ex: 'my-app'
 * @param {Object} settings.authRequest.requestedPermissions
 * @param {string | boolean} settings.authRequest.returnURL : false, // set this if you don't want a popup
 * @param {string} [settings.authRequest.referer] To track registration source 
 * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
 * @param {Browser.AuthStateChangeHandler} settings.onStateChange
 * @param {string} [settings.returnURL=auto#]  Set to "self#" to disable popup and force using the same page. Set a custom url when process is finished (specific use cases). Should always end by # ? or &
 * @param {string} serviceInfoUrl
 * @param {Object} [serviceCustomizations] override properties of serviceInfoUrl 
 * @returns {Pryv.Service}
 * TODO IEVA - how end developer should access methods in the AuthController like 
 * messages depending on the state
 */
async function setupAuth (settings, serviceInfoUrl, serviceCustomizations) {
  let loginButton
  if (settings.spanButtonID && !settings.onStateChange) {
    //loginButton = new LoginButton(authController);
    //settings.onStateChange = loginButton.onStateChange.bind(loginButton);
  }
  const authController = new AuthController(settings, serviceInfoUrl, serviceCustomizations);
  if (settings.spanButtonID && !settings.onStateChange) {
    loginButton = new LoginButton(authController);
    //settings.onStateChange = loginButton.onStateChange.bind(loginButton);
  }
  const authService = await authController.init();
  if (loginButton) {
    await loginButton.init();
  }
  return authService;
}


module.exports = {
  setupAuth: setupAuth,
  AuthStates: AuthStates,
  serviceInfoFromUrl: AuthController.getServiceInfoFromURL
}



/**
 * Notify the requesting code of all important changes
 * - ERROR => {message: <string>, error: <error>}
 * - LOADING => {}
 * - INITIALIZED => {serviceInfo: <PryvServiceInfo>, action: <Open Popup Function>}
 * - AUTHORIZED => {apiEndpoint: <PryvApiEndpoint>, serviceInfo: <PryvServiceInfo>, displayName: <string> action: <Open Logout Question>}
 * - LOGOUT => {}
 * @callback AuthStateChangeHandler
 * @param {Object} state
 * @param {Pryv.Browser.AuthState} state.id  one of ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 */
