
const regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;
const regexSchemaAndPath = /(.+):\/\/(.+)/gm;

/**
 * Utilities to access Pryv API.
 * Exposes superagent and methods to manipulate Pryv's api endpoints 
 * @memberof Pryv
 * @namespace Pryv.utils
 */
const utils = {

  /**
   * Exposes superagent https://visionmedia.github.io/superagent/
   * @memberof Pryv.utils
   * @property {Superagent} superagent 
   */
  superagent: require('superagent'),

  /**
   * From a PryvApiEndpoint URL, return an object (TokenAndAPI) with two properties
   * @memberof Pryv.utils
   * @param {PryvApiEndpoint} pryvApiEndpoint
   * @returns {TokenAndEndpoint}
   */
  extractTokenAndApiEndpoint: function (pryvApiEndpoint) {
    regexAPIandToken.lastIndex = 0;
    const res = regexAPIandToken.exec(pryvApiEndpoint);

    if (res !== null) { // has token
      // add a trailing '/' to end point if missing
      if (!res[3].endsWith('/')) {
        res[3] += '/';
      }
      return { endpoint: res[1] + '://' + res[3], token: res[2] }
    }
    // else check if valid url
    regexSchemaAndPath.lastIndex = 0;
    const res2 = regexSchemaAndPath.exec(pryvApiEndpoint);
    if (res2 === null) {
      throw new Error('Cannot find endpoint, invalid URL format');
    }
    // add a trailing '/' to end point if missing
    if (!res2[2].endsWith('/')) {
      res2[2] += '/';
    }

    return { endpoint: res2[1] + '://' + res2[2] , token: null }
  },

  /**
   * Get a PryvApiEndpoint URL from a TokenAndAPI object
   * @memberof Pryv.utils
   * @param {TokenAndEndpoint} tokenAndApi
   * @returns {PryvApiEndpoint}
   */
  buildPryvApiEndPoint: function (tokenAndApi) {
    if (! tokenAndApi.token) { 
      let res = tokenAndApi.endpoint + '';
      if (!tokenAndApi.endpoint.endsWith('/')) {
        res += '/';
      }
      return res; 
    }
    regexSchemaAndPath.lastIndex = 0;
    let res = regexSchemaAndPath.exec(tokenAndApi.endpoint);
    // add a trailing '/' to end point if missing
    if (!res[2].endsWith('/')) {
      res[2] += '/';
    }
    return res[1] + '://' + tokenAndApi.token + '@' + res[2];
  }

}

module.exports = utils;

// --------------- typedfs ------------------------------- //

/**
 * An object with two properties: token & apiEndpoint
 * @typedef {Object} TokenAndEndpoint
 * @property {string}  [token] Authorization token
 * @property {string}  endpoint url of Pryv api endpoint
 */

/**
 * A String url of the form http(s)://{token}@{apiEndpoint}
 * @typedef {string} PryvApiEndpoint
 */


/**
 * Common Meta are returned by each standard call on the API https://api.pryv.com/reference/#in-method-results
 * @typedef {Object} CommonMeta
 * @property {string} apiVersion The version of the API in the form {major}.{minor}.{revision}. Mirrored in HTTP header API-Version.
 * @property {number} serverTime The current server time as a timestamp in second. Keeping track of server time is necessary to properly handle time in API calls.
 * @property {string} serial The serial will change every time the core or register is updated. If you compare it with the serial of a previous response and notice a difference, you should reload the service information.
 */