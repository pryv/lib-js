/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * @pryv/encryption — client-side encryption and decryption of Pryv.io events.
 *
 * - `Keyring`: a key store with a pluggable chain of async key resolvers.
 * - `EventsCipher`: encrypts / decrypts events using registered methods.
 * - `methods`: the built-in encryption methods (currently `aes-256-gcm`).
 */
const EventsCipher = require('./EventsCipher');
const Keyring = require('./Keyring');
const methods = require('./methods');

module.exports = { EventsCipher, Keyring, methods };
