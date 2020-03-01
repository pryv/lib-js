const utils = require('./utils.js');
/**
 * @class ServiceAssets
 * Holds Pryv Service informations
 *
 *
 * @property { TokenAndEndpoint } tokenAndApi
 * @memberof Pryv
 *
 * @constructor
 * @this { ServiceAssets }
 * @param { string } pryvServiceAssetsSourceUrl Url point to assets of the service of a Pryv platform: https://api.pryv.com/reference/#service-info property `assets.src`
 **/
class ServiceAssets {


  constructor(assets, assetsURL) {
    this._assets = assets;
    this._assetsURL = assetsURL;
  }

  /**
   * Load Assets definition
   * @param {string} pryvServiceAssetsSourceUrl
   * @returns {ServiceAssets}
   */
  static async setup(pryvServiceAssetsSourceUrl) {
    const res = await utils.superagent.get(pryvServiceAssetsSourceUrl);
    return new ServiceAssets(res.body, pryvServiceAssetsSourceUrl);
  }

  /**
   * Set service Favicon to Web Page
   */
  async setServiceFavicon() {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = this.relativeURL(this._assets.favicon.default.url);
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  /**
   * Load CSS for Login button
   */
  async setCSSForLogin() {
    loadCSS(this.relativeURL(this._assets.libJavascript.buttonSignIn.url));
  }

  /**
   * get relativeUrl
   */
  relativeURL(url) {
    return relPathToAbs(this._assets.baseUrl || this._assetsURL, url);
  }

}



function loadCSS(url) {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.id = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  link.media = 'all';
  head.appendChild(link);
}

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

function relPathToAbs(baseUrlString, sRelPath) {
  console.log("****", baseUrlString, sRelPath);
  var baseLocation = location;
  if (baseUrlString) {
    baseLocation = document.createElement('a');
    baseLocation.href = baseUrlString;
  }
  console.log(baseLocation, sRelPath);
  var nUpLn, sDir = "", sPath = baseLocation.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
  for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
    nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
    sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"),
      "/");
  }
  return baseLocation.protocol + '//' + baseLocation.hostname + ':' +
    baseLocation.port + sDir + sPath.substr(nStart);
}


module.exports = ServiceAssets;