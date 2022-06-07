/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

const utils = require('../utils');

/**
 * @memberof pryv.Browser
 * @namespace pryv.Browser.CookieUtils
 */
module.exports = {
  get,
  set,
  del
};

/**
  * Set a local cookie
  * @memberof pryv.Browser.CookieUtils
  * @param {string} cookieKey - The key for the cookie
  * @param {mixed} value - The Value
  * @param {number} expireInDays - Expiration date in days from now
  */
function set (cookieKey, value, expireInDays) {
  if (!utils.isBrowser()) return;
  expireInDays = expireInDays || 365;
  const myDate = new Date();
  const hostName = window.location.hostname;
  const path = window.location.pathname;
  myDate.setDate(myDate.getDate() + expireInDays);
  let cookieStr = encodeURIComponent(cookieKey) + '=' +
    encodeURIComponent(JSON.stringify(value)) +
    ';expires=' + myDate.toGMTString() +
    ';domain=.' + hostName + ';path=' + path;
  // do not add SameSite when removing a cookie
  if (expireInDays >= 0) cookieStr += ';SameSite=Strict';
  document.cookie = cookieStr;
}

/**
 * Return the value of a local cookie
 * @memberof pryv.Browser.CookieUtils
 * @param cookieKey - The key
 */
function get (cookieKey) {
  const name = encodeURIComponent(cookieKey);
  if (!utils.isBrowser()) return;
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  if (parts.length === 2) return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
}

/**
 * Delete a local cookie
 * @memberof pryv.Browser.CookieUtils
 * @param cookieKey - The key
 */
function del (cookieKey) {
  set(cookieKey, { deleted: true }, -1);
}
