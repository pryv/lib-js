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
 * @typedef {Object} CookieOptions
 * @property {string} [path='/'] - Cookie path (the whole site by default)
 * @property {boolean} [secure] - Defaults to true on https pages
 * @property {'Strict'|'Lax'|'None'} [sameSite='Strict']
 * @property {string} [domain] - Omitted by default: the cookie is sent to this exact host only
 */

const EXPIRED = ';expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=0';

/**
  * Set a local cookie. Copies of the same cookie left on the current page's
  * path or its parents (versions up to 3.16 wrote the cookie for the page's
  * own path and for every subdomain) are removed, so only one copy remains.
  * @memberof pryv.Browser.CookieUtils
  * @template T
  * @param {string} cookieKey - The key for the cookie
  * @param {T} value - The value (will be JSON stringified)
  * @param {number} [expireInDays=365] - Expiration date in days from now
  * @param {CookieOptions} [options]
  */
function set (cookieKey, value, expireInDays, options) {
  if (!utils.isBrowser()) return;
  expireInDays = expireInDays || 365;
  const opts = withDefaults(options);
  const name = encodeURIComponent(cookieKey);
  removeCopies(name, opts, opts.path);
  const myDate = new Date();
  myDate.setDate(myDate.getDate() + expireInDays);
  document.cookie = name + '=' +
    encodeURIComponent(JSON.stringify(value)) +
    ';expires=' + myDate.toUTCString() + attributes(opts, opts.path, opts.domain);
}

/**
 * Return the value of a local cookie. When several copies are sent (copies
 * left on a deeper path by an older version), the one with the shortest path
 * is used: browsers list it last.
 * @memberof pryv.Browser.CookieUtils
 * @template T
 * @param {string} cookieKey - The key
 * @returns {T|undefined} The parsed cookie value or undefined if not found or unreadable
 */
function get (cookieKey) {
  const name = encodeURIComponent(cookieKey);
  if (!utils.isBrowser()) return;
  const parts = ('; ' + document.cookie).split('; ' + name + '=');
  if (parts.length < 2) return;
  try {
    return JSON.parse(decodeURIComponent(parts[parts.length - 1].split(';').shift()));
  } catch (e) {
    return undefined;
  }
}

/**
 * Delete a local cookie, including the copies older versions left on the
 * current page's path and its parents.
 * @memberof pryv.Browser.CookieUtils
 * @param {string} cookieKey - The key
 * @param {CookieOptions} [options] - `path` (default '/') and `domain` as given to set()
 */
function del (cookieKey, options) {
  if (!utils.isBrowser()) return;
  removeCopies(encodeURIComponent(cookieKey), withDefaults(options), null);
}

function withDefaults (options) {
  const opts = Object.assign({}, options);
  if (opts.path == null) opts.path = '/';
  if (opts.secure == null) opts.secure = window.location.protocol === 'https:';
  if (opts.sameSite == null) opts.sameSite = 'Strict';
  return opts;
}

function attributes (opts, path, domain) {
  return (domain != null ? ';domain=' + domain : '') + ';path=' + path +
    ';SameSite=' + opts.sameSite + (opts.secure ? ';Secure' : '');
}

/**
 * Expire every copy of the cookie this page can see or that `opts` targets,
 * host-only and Domain variants, except the host-only copy at `keepPath`.
 * A script cannot read a cookie's path; the paths a copy visible here can
 * have are the page's path and its parents, with and without a trailing slash.
 */
function removeCopies (name, opts, keepPath) {
  const legacyDomain = '.' + window.location.hostname;
  const paths = candidatePaths(window.location.pathname);
  if (!paths.includes(opts.path)) paths.push(opts.path);
  for (const path of paths) {
    document.cookie = name + '=' + EXPIRED + attributes(opts, path, legacyDomain);
    if (opts.domain != null && opts.domain !== legacyDomain) {
      document.cookie = name + '=' + EXPIRED + attributes(opts, path, opts.domain);
    }
    if (path !== keepPath || opts.domain != null) document.cookie = name + '=' + EXPIRED + attributes(opts, path, null);
  }
}

function candidatePaths (pathname) {
  const paths = ['/'];
  let path = '';
  for (const segment of pathname.split('/').filter(Boolean)) {
    path += '/' + segment;
    paths.push(path, path + '/');
  }
  return paths;
}
