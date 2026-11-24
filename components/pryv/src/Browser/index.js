/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const LoginButton = require('./LoginButton');
const CookieUtils = require('./CookieUtils');
const utils = require('../utils');

/**
 * @memberof pryv
 * @namespace pryv.Browser
 */
module.exports = {
  LoginButton,
  CookieUtils,
  // retro-compatibility for lib-js < 2.0.9
  AuthStates: require('../Auth/AuthStates'),
  setupAuth: require('../Auth').setupAuth,
  serviceInfoFromUrl: getServiceInfoFromURL
};

function isAbsoluteHttpUrl (value) {
  return utils.isHttpUrl(value, '');
}

/**
 * The service information URL named by the `pryvServiceInfoUrl` query parameter.
 * The parameter lets whoever wrote the link choose the platform: an app serving
 * known platforms should pass `allowedServiceInfoUrls`.
 * @param {string} [url] - default: the URL of the page
 * @param {Object} [options]
 * @param {Array<string>} [options.allowedServiceInfoUrls] - accept these only
 * @returns {string|undefined} undefined when absent, not an http(s) URL, or not allowed
 */
function getServiceInfoFromURL (url, options) {
  const value = utils.getQueryParamsFromURL(url || window.location.href).pryvServiceInfoUrl;
  if (!isAbsoluteHttpUrl(value)) return undefined;
  const allowed = options?.allowedServiceInfoUrls;
  if (allowed != null && !allowed.some((a) => isAbsoluteHttpUrl(a) && new URL(a).href === new URL(value).href)) {
    console.warn('pryv: the pryvServiceInfoUrl of the page address is not an allowed service');
    return undefined;
  }
  return value;
}
