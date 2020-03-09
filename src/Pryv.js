
/**
 * Pryv library
 * @version 1.0
 * @exports Pryv
 * @namespace Pryv
 * @property {Service} Service
 * @property {Connection} Connection
 * @property {Browser} Browser
 * @property {utils} utils
 */
module.exports = {
  Service: require('./Service'),
  Connection: require('./Connection'),
  Browser: require('./Browser'),
  utils: require('./utils')
}