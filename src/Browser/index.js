const LoginButton = require('./LoginButton');
const CookieUtils = require('./CookieUtils');
const utils = require('../utils');

/**
 * @memberof Pryv
 * @namespace Pryv.Browser
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
  return queryParams.pryvServiceInfoUrl;
}
