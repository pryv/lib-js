/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Pryv library
 * @version 1.0
 * @exports Pryv
 * @property {Pryv.Service} Service - To interact with Pryv.io at a "Platform level"
 * @property {Pryv.Connection} Connection - To interact with an individual's (user) data set
 * @property {Pryv.Browser} Browser - Browser Tools - Access request helpers and visuals (button)
 * @property {Pryv.utils} utils - Exposes **superagent** for HTTP calls and tools to manipulate Pryv's Api Endpoints
 */
module.exports = {
  Service: require('./Service'),
  Connection: require('./Connection'),
  Auth: require('./Auth'),
  Browser: require('./Browser'),
  utils: require('./utils'),
  version: require('../package.json').version
};
