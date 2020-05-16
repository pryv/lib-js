
const utils = require('../utils');
/**
 * @memberof Pryv.Browser
 * @namespace Pryv.Browser.CookieUtils
 */

/**
  * Set a Local cookier
  * @memberof Pryv.Browser.CookieUtils
  * @param {string} cookieKey - The key for the cookie
  * @param {mixed} value - The Value 
  * @param {number} expireInDays - Expiration date in days from now
  */
function set(cookieKey, value, expireInDays) {
  if (! utils.isBrowser()) return;
  expireInDays = expireInDays || 365;
  var myDate = new Date();
  var hostName = window.location.hostname;
  var path = window.location.pathname;
  myDate.setDate(myDate.getDate() + expireInDays);
  var cookieStr = encodeURIComponent(cookieKey) + '=' + encodeURIComponent(JSON.stringify(value))
    + ';expires=' + myDate.toGMTString()
    + ';domain=.' + hostName + ';path=' + path;
    // do not add SameSite when removing a cookie
  if (expireInDays >= 0) cookieStr += ';SameSite=Strict';
  document.cookie = cookieStr;
}
exports.set = set;

/**
 * returns the value of a local cookie
 * @memberof Pryv.Browser.CookieUtils
 * @param cookieKey - The key
 */
exports.get = function get(cookieKey) {
  const name = encodeURIComponent(cookieKey);
  if (! utils.isBrowser()) return;
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return JSON.parse(decodeURIComponent(parts.pop().split(";").shift()));
}

/**
 * delete a local cookie
 * @memberof Pryv.Browser.CookieUtils
 * @param cookieKey - The key
 */
exports.del = function del(cookieKey) {
  set(cookieKey, {deleted: true}, -1);
}