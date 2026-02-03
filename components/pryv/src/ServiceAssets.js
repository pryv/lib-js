/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('./utils.js');

/* global location */

/**
 * Holds Pryv Service informations.
 *
 * It's returned by `service.assets()`
 *
 * @memberof pryv
 **/
class ServiceAssets {
  /**
   * Private => use ServiceAssets.setup()
   * @param {Object} assets The content of service/info.assets properties.
   * @param {string} assetsURL Url point to assets of the service of a Pryv platform
   */
  constructor (assets, assetsURL) {
    this._assets = assets;
    this._assetsURL = assetsURL;
  }

  /**
   * Load Assets definition from URL
   * @param {string} pryvServiceAssetsSourceUrl - URL to the assets definition JSON
   * @returns {Promise<ServiceAssets>} Promise resolving to ServiceAssets instance
   */
  static async setup (pryvServiceAssetsSourceUrl) {
    const { body } = await utils.fetchGet(pryvServiceAssetsSourceUrl);
    return new ServiceAssets(body, pryvServiceAssetsSourceUrl);
  }

  /**
   * get a value from path separated by `:`
   * example of key `lib-js:buttonSignIn`
   * @param {string} [keyPath] if null, will return the all assets
   */
  get (keyPath) {
    let result = Object.assign({}, this._assets);
    if (keyPath) {
      keyPath.split(':').forEach((key) => {
        result = result[key];
        if (typeof result === 'undefined') return result;
      });
    }
    return result;
  }

  /**
   * get an Url from path separated by `:`
   * identical to doing assets.relativeURL(assets.get(keyPath))
   * example of key `lib-js:buttonSignIn`
   * @param {string} [keyPath] if null, will return the all assets
   */
  getUrl (keyPath) {
    const url = this.get(keyPath);
    if (typeof url !== 'string') {
      throw new Error(`Unexpected value for ${keyPath}: ${url}`);
    }
    return this.relativeURL(url);
  }

  /**
   * get relativeUrl
   */
  relativeURL (url) {
    return relPathToAbs(this._assets.baseUrl || this._assetsURL, url);
  }

  // ---------------- Default service resources

  /**
   * Set all defaults Favicon, CSS
   */
  async setAllDefaults () {
    this.setFavicon();
    await this.loadCSS();
  }

  /**
   * Set service Favicon to Web Page
   */
  setFavicon () {
    /** @type {HTMLLinkElement} */
    // @ts-ignore - querySelector returns Element but we know it's HTMLLinkElement
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = this.relativeURL(this._assets.favicon.default.url);
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  /**
   * Set default service CSS
   */
  async loadCSS () {
    loadCSS(this.relativeURL(this._assets.css.default.url));
  }

  // ---- Login

  /**
   * Load CSS for Login button
   */
  async loginButtonLoadCSS () {
    loadCSS(this.relativeURL(this._assets['lib-js'].buttonSignIn.css));
  }

  /**
   * Get HTML for Login Button
   * @returns {Promise<string>} Promise resolving to HTML string
   */
  async loginButtonGetHTML () {
    const { text } = await utils.fetchGetText(this.relativeURL(this._assets['lib-js'].buttonSignIn.html));
    return text;
  }

  /**
   * Get Messages strings for Login Button
   * @returns {Promise<Object.<string, string>>} Promise resolving to messages object
   */
  async loginButtonGetMessages () {
    const { body } = await utils.fetchGet(this.relativeURL(this._assets['lib-js'].buttonSignIn.messages));
    return body;
  }
}

module.exports = ServiceAssets;

function loadCSS (url) {
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.id = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  link.media = 'all';
  head.appendChild(link);
}

/* HACK: disabling linting until code is cleaned up */
/* eslint-disable */

  /*\
  |*| Modified version of
  |*| :: translate relative paths to absolute paths ::
  |*|
  |*| https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
  |*|
  |*| The following code is released under the GNU Public License, version 3 or later.
  |*| http://www.gnu.org/licenses/gpl-3.0-standalone.html
  |*|
  \*/

function relPathToAbs (baseUrlString, sRelPath) {
  /** @type {Location|HTMLAnchorElement} */
  var baseLocation = location;
  if (baseUrlString) {
    // @ts-ignore - HTMLAnchorElement has compatible URL properties
    baseLocation = document.createElement('a');
    baseLocation.href = baseUrlString;
  }

  var nUpLn, sDir = "", sPath = baseLocation.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
  for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
    nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
    sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"),
      "/");
  }
  const portStr = baseLocation.port ? ':' + baseLocation.port : '';
  return baseLocation.protocol + '//' + baseLocation.hostname + portStr + sDir + sPath.substr(nStart);
}
