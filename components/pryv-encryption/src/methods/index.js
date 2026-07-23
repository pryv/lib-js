/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Registry of built-in encryption methods, keyed by their method name (the
 * suffix of an `encrypted/<method>` event type).
 */
const aes256gcm = require('./aes-256-gcm');

module.exports = {
  'aes-256-gcm': aes256gcm
};
