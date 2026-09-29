/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const AuthController = require('./AuthController');
const AuthStates = require('./AuthStates');
const LoginButton = require('../Browser/LoginButton');
const Service = require('../Service');

/**
 * @memberof pryv
 * @namespace pryv.Auth
 */
module.exports = {
  setupAuth,
  AuthStates,
  AuthController
};

/**
 * Start an authentication process
 *
 * @memberof pryv.Auth
 * @param {Object} settings
 * @param {Object} settings.authRequest See https://api.pryv.com/reference/#data-structure-access
 * @param {string} [settings.authRequest.languageCode] Language code, as per LoginButton Messages: 'en', 'fr
 * @param {string} settings.authRequest.requestingAppId Application id, ex: 'my-app'
 * @param {Object} settings.authRequest.requestedPermissions
 * @param {string | false} [settings.authRequest.returnURL] 'auto#' (default, also when unset or false):
 *   popup on desktop, redirect on a phone or tablet; 'self#': always redirect back to this page;
 *   a URL: always redirect back to that URL. Must end with '#', '?' or '&'.
 * @param {string} [settings.authRequest.referer] To track registration source
 * @param {string} settings.spanButtonID set and <span> id in DOM to insert default login button or null for custom
 * @param {Function} settings.onStateChange
 * @param {string} serviceInfoUrl
 * @param {Object} [serviceCustomizations] override properties of serviceInfoUrl
 * @returns {Promise<Service>}
 */
async function setupAuth (settings, serviceInfoUrl, serviceCustomizations, HumanInteraction = LoginButton) {
  const service = new Service(serviceInfoUrl, serviceCustomizations);
  await service.info();

  const humanInteraction = new HumanInteraction(settings, service);
  await humanInteraction.init();

  return service;
}
