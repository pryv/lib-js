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

/**
 * Util to grab parameters from url query string
 * @param {*} url
 */
function getServiceInfoFromURL (url) {
  const queryParams = utils.getQueryParamsFromURL(url || window.location.href);
  // TODO: remove deprecated param `pryvServiceInfoUrl` with next major version
  return queryParams.serviceInfoUrl ?? queryParams.pryvServiceInfoUrl;
}
