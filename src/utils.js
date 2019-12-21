const regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;


/**
 * From a PryvApiEndpoint URL, return an object (TokenAndAPI) with two properties
 * @param {PryvApiEndpoint} pryvApiEndpoint
 * @returns {TokenAndEndpoint}
 */
exports.extractTokenAndApiEndpoint = function extractTokenAndApiEndpoint(pryvApiEndpoint) {
  regexAPIandToken.lastIndex = 0;
  const res = regexAPIandToken.exec(pryvApiEndpoint);
  return { endpoint: res[1] + '://' + res[3], token: res[2] }
}


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