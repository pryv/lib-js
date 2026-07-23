/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Encrypts and decrypts Pryv.io events.
 *
 * An encrypted event carries `type: "encrypted/<method>"` and a
 * `content: { payload, keyRef?, hint? }`. All other envelope fields
 * (id, streamIds, time, created, …) stay in plaintext.
 *
 * Decryption is defensive: any failure leaves the event untouched (the exact
 * same reference is returned) and, when configured, is reported through
 * `onDecryptError` — a failed decryption never throws and never drops an event.
 * Encryption, by contrast, throws on error.
 */
const Keyring = require('./Keyring');
const builtinMethods = require('./methods');

const ENCRYPTED_TYPE_PREFIX = 'encrypted/';

class EventsCipher {
  /**
   * @param {Keyring} keyring
   * @param {Object} [options]
   * @param {(event: Object, error: Error) => void} [options.onDecryptError] called on any decryption failure. Default: silent.
   */
  constructor (keyring, options = {}) {
    if (!(keyring instanceof Keyring)) {
      throw new Error('EventsCipher requires a Keyring');
    }
    this.keyring = keyring;
    this.onDecryptError = (options && options.onDecryptError) || null;
    // Clone the built-ins so registerMethod() never mutates the shared map.
    this._methods = Object.assign({}, builtinMethods);
  }

  /**
   * Register (or override) an encryption method. `decrypt` is required;
   * `encrypt` is optional (a decrypt-only method supports reading existing
   * encrypted events but cannot produce new ones).
   * @param {string} name
   * @param {{ decrypt: Function, encrypt?: Function }} method
   * @returns {EventsCipher} this, for chaining.
   */
  registerMethod (name, method) {
    if (!method || typeof method.decrypt !== 'function' ||
        (method.encrypt != null && typeof method.encrypt !== 'function')) {
      throw new Error('registerMethod expects a { decrypt } function and an optional { encrypt } function');
    }
    this._methods[name] = method;
    return this;
  }

  /**
   * Encrypt a plain event. Throws on unknown method or missing key.
   * @param {Object} plainEvent
   * @param {Object} params
   * @param {string} params.method
   * @param {string} [params.keyRef]
   * @param {*} [params.hint]
   * @returns {Promise<Object>} a new encrypted event (input is not mutated).
   */
  async encryptEvent (plainEvent, params = {}) {
    const { method: methodName, keyRef, hint } = params;
    const method = this._methods[methodName];
    if (!method) {
      throw new Error(`Unknown encryption method: ${methodName}`);
    }
    if (typeof method.encrypt !== 'function') {
      throw new Error(`Method "${methodName}" is decrypt-only and cannot encrypt`);
    }
    const key = await this.keyring.getKeyFor(methodName, keyRef, hint);
    if (key == null) {
      throw new Error(`No key available for method "${methodName}"${keyRef != null ? ` (keyRef "${keyRef}")` : ''}`);
    }

    const material = { type: plainEvent.type, content: plainEvent.content };
    const content = await method.encrypt(material, key);
    if (keyRef != null) content.keyRef = keyRef;
    if (hint != null) content.hint = hint;

    const encrypted = Object.assign({}, plainEvent);
    encrypted.type = ENCRYPTED_TYPE_PREFIX + methodName;
    encrypted.content = content;
    return encrypted;
  }

  /**
   * Decrypt a single event. Never throws.
   * - Non-encrypted or unregistered-method events are returned untouched (same ref).
   * - On any failure the original event is returned (same ref) and
   *   `onDecryptError(event, error)` is called when configured.
   * - On success a NEW object is returned with restored `type`/`content`,
   *   preserved envelope fields, and a `decryptedFrom` back-reference.
   * @param {Object} event
   * @returns {Promise<Object>}
   */
  async decryptEvent (event) {
    const methodName = methodNameFromType(event && event.type);
    if (methodName == null) return event;
    const method = this._methods[methodName];
    if (!method) return event;

    try {
      const content = event.content || {};
      const key = await this.keyring.getKeyFor(methodName, content.keyRef, content.hint);
      if (key == null) {
        throw new Error(`No key available for method "${methodName}"`);
      }
      const material = await method.decrypt(content, key);
      if (material == null || material.type == null || material.content == null) {
        throw new Error('Decrypted payload is missing "type" or "content"');
      }
      return Object.assign({}, event, material, { decryptedFrom: event });
    } catch (error) {
      if (this.onDecryptError) this.onDecryptError(event, error);
      return event;
    }
  }

  /**
   * Decrypt an array of events. Never throws; failures pass through untouched.
   * @param {Object[]} events
   * @returns {Promise<Object[]>}
   */
  async decryptEvents (events) {
    return Promise.all(events.map((event) => this.decryptEvent(event)));
  }

  /**
   * Wrap a `forEachEvent`-style callback so each event is decrypted before it
   * is forwarded to the user callback.
   * @param {(event: Object) => *} callback
   * @returns {(event: Object) => Promise<*>}
   */
  wrapForEachEvent (callback) {
    return async (event) => {
      const decrypted = await this.decryptEvent(event);
      return callback(decrypted);
    };
  }

  /**
   * Return the original encrypted event a decrypted event came from, or the
   * event itself when it was never decrypted.
   * @param {Object} event
   * @returns {Object}
   */
  stripDecrypted (event) {
    if (event && event.decryptedFrom != null) return event.decryptedFrom;
    return event;
  }
}

/**
 * Extract the method name from an `encrypted/<method>` type, or null.
 * @param {*} type
 * @returns {?string}
 */
function methodNameFromType (type) {
  if (typeof type !== 'string' || !type.startsWith(ENCRYPTED_TYPE_PREFIX)) return null;
  const name = type.slice(ENCRYPTED_TYPE_PREFIX.length);
  return name.length > 0 ? name : null;
}

module.exports = EventsCipher;
