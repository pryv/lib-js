const LoginButton = require('./LoginButton');
const CookieUtils = require('./CookieUtils');
const Service = require('../Service');
const utils = require('../utils');

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
 */
async function setupAuth (settings, serviceInfoUrl, serviceCustomizations, HumanInteraction = LoginButton) {

  let service = new Service(serviceInfoUrl, serviceCustomizations);
  await service.info()

  const humanInteraction = new HumanInteraction(settings, service);
  await HumanInteraction.init();

  return service;
}

/**
 * Util to grab parameters from url query string
 * @param {*} url 
 */
function getServiceInfoFromURL (url) {
  const queryParams = utils.getQueryParamsFromURL(url || window.location.href);
  return queryParams['pryvServiceInfoUrl'];
}

module.exports = {
  LoginButton: LoginButton,
  CookieUtils: CookieUtils,
  // retro-compatibility for lib-js < 2.0.9
  AuthStates: require('../Auth/AuthStates'),
  setupAuth: require('../Auth').setupAuth,
  serviceInfoFromUrl: getServiceInfoFromURL
};
