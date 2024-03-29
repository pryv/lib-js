/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;
const regexSchemaAndPath = /(.+):\/\/(.+)/gm;

/**
 * Utilities to access Pryv API.
 * Exposes superagent and methods to manipulate API endpoints
 * @memberof pryv
 * @namespace pryv.utils
 */
const utils = module.exports = {
  /**
   * Exposes superagent https://visionmedia.github.io/superagent/
   * @memberof pryv.utils
   * @property {Superagent} superagent
   */
  superagent: require('superagent'),

  /**
   * Returns true is run in a browser
   * @memberof pryv.utils
   * @returns {boolean}
   */
  isBrowser: function () {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },

  /**
   * From a APIEndpoint URL, return an object (TokenAndAPI) with two properties
   * @memberof pryv.utils
   * @param {APIEndpoint} apiEndpoint
   * @returns {TokenAndEndpoint}
   */
  extractTokenAndAPIEndpoint: function (apiEndpoint) {
    regexAPIandToken.lastIndex = 0;
    const res = regexAPIandToken.exec(apiEndpoint);

    if (res !== null) { // has token
      // add a trailing '/' to end point if missing
      if (!res[3].endsWith('/')) {
        res[3] += '/';
      }
      return { endpoint: res[1] + '://' + res[3], token: res[2] };
    }
    // else check if valid url
    regexSchemaAndPath.lastIndex = 0;
    const res2 = regexSchemaAndPath.exec(apiEndpoint);
    if (res2 === null) {
      throw new Error('Cannot find endpoint, invalid URL format');
    }
    // add a trailing '/' to end point if missing
    if (!res2[2].endsWith('/')) {
      res2[2] += '/';
    }

    return { endpoint: res2[1] + '://' + res2[2], token: null };
  },

  /**
   * Get a APIEndpoint URL from a TokenAndAPI object
   * @memberof pryv.utils
   * @param {TokenAndEndpoint} tokenAndAPI
   * @returns {APIEndpoint}
   */
  buildAPIEndpoint: function (tokenAndAPI) {
    if (!tokenAndAPI.token) {
      let res = tokenAndAPI.endpoint + '';
      if (!tokenAndAPI.endpoint.endsWith('/')) {
        res += '/';
      }
      return res;
    }
    regexSchemaAndPath.lastIndex = 0;
    const res = regexSchemaAndPath.exec(tokenAndAPI.endpoint);
    // add a trailing '/' to end point if missing
    if (!res[2].endsWith('/')) {
      res[2] += '/';
    }
    return res[1] + '://' + tokenAndAPI.token + '@' + res[2];
  },

  /**
   *
   * @param {Object} [navigatorForTests] mock navigator var only for testing purposes
   */
  browserIsMobileOrTablet: function (navigator) {
    if (navigator == null) {
      return false;
    }
    let check = false;
    // eslint-disable-next-line no-useless-escape
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || navigator.opera);
    return check;
  },

  cleanURLFromPrYvParams: function (url) {
    const PRYV_REGEXP = /[?#&]+prYv([^=&]+)=([^&]*)/g;
    return url.replace(PRYV_REGEXP, '');
  },

  getQueryParamsFromURL: function (url) {
    const vars = {};
    const QUERY_REGEXP = /[?#&]+([^=&]+)=([^&]*)/g;
    url.replace(QUERY_REGEXP,
      function (m, key, value) {
        vars[key] = decodeURIComponent(value);
      });
    return vars;
  }
};

// TODO: remove following deprecated aliases with next major version

/**
 * @deprecated Renamed to `extractTokenAndAPIEndpoint()`
 */
utils.extractTokenAndApiEndpoint = utils.extractTokenAndAPIEndpoint;

/**
 * @deprecated Renamed to `buildAPIEndpoint()`
 */
// TODO: remove deprecated alias with next major version
utils.buildPryvApiEndpoint = utils.buildAPIEndpoint;

// --------------- typedfs ------------------------------- //

/**
 * An object with two properties: token & apiEndpoint
 * @typedef {Object} TokenAndEndpoint
 * @property {string} [token] Authorization token
 * @property {string} endpoint url of API endpoint
 */

/**
 * A String url of the form http(s)://{token}@{apiEndpoint}
 * @typedef {string} APIEndpoint
 */

/**
 * Common Meta are returned by each standard call on the API https://api.pryv.com/reference/#in-method-results
 * @typedef {Object} CommonMeta
 * @property {string} apiVersion The version of the API in the form {major}.{minor}.{revision}. Mirrored in HTTP header API-Version.
 * @property {number} serverTime The current server time as a timestamp in second. Keeping track of server time is necessary to properly handle time in API calls.
 * @property {string} serial The serial will change every time the core or register is updated. If you compare it with the serial of a previous response and notice a difference, you should reload the service information.
 */
