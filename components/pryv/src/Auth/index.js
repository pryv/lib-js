/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const AuthController = require('./AuthController');
const AuthStates = require('./AuthStates');
const LoginButton = require('../Browser/LoginButton');
const Service = require('../Service');

/**
 * @memberof Pryv
 * @namespace Pryv.Auth
 */
module.exports = {
  setupAuth,
  AuthStates,
  AuthController
};

/**
 * Start an authentication process
 *
 * @memberof Pryv.Auth
 * @param {Object} settings
 * @param {Object} settings.authRequest See https://api.pryv.com/reference/#data-structure-access
 * @param {string} [settings.authRequest.languageCode] Language code, as per LoginButton Messages: 'en', 'fr
 * @param {string} settings.authRequest.requestingAppId Application id, ex: 'my-app'
 * @param {Object} settings.authRequest.requestedPermissions
 * @param {string | boolean} settings.authRequest.returnURL : false, // set this if you don't want a popup
 * @param {string} [settings.authRequest.referer] To track registration source
 * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
 * @param {Browser.AuthStateChangeHandler} settings.onStateChange
 * @param {string} [settings.returnURL=auto#]  Set to "self#" to disable popup and force using the same page. Set a custom url when process is finished (specific use cases). Should always end by # ? or &
 * @param {string} serviceInfoUrl
 * @param {Object} [serviceCustomizations] override properties of serviceInfoUrl
 * @returns {Pryv.Service}
 */
async function setupAuth (settings, serviceInfoUrl, serviceCustomizations, HumanInteraction = LoginButton) {
  const service = new Service(serviceInfoUrl, serviceCustomizations);
  await service.info();

  const humanInteraction = new HumanInteraction(settings, service);
  await humanInteraction.init();

  return service;
}
