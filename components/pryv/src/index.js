/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * `pryv` library
 * @exports pryv
 * @property {pryv.Service} Service - To interact with Pryv.io at a "Platform level"
 * @property {pryv.Connection} Connection - To interact with an individual's (user) data set
 * @property {pryv.Browser} Browser - Browser Tools - Access request helpers and visuals (button)
 * @property {pryv.utils} utils - Exposes some utils for HTTP calls and tools to manipulate Pryv's API endpoints
 * @property {pryv.PryvError} PryvError - Custom error class with innerObject + structured API-error fields
 * @property {Object} ERRORS - Catalogue of Pryv API error ids (mirrors open-pryv.io/components/errors)
 */
module.exports = {
  Service: require('./Service'),
  Connection: require('./Connection'),
  Auth: require('./Auth'),
  Browser: require('./Browser'),
  utils: require('./utils'),
  PryvError: require('./lib/PryvError'),
  ERRORS: require('./lib/errorIds'),
  version: require('../package.json').version
};
