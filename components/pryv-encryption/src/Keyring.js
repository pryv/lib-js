/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * A key store with a pluggable chain of asynchronous resolvers.
 *
 * Resolution order for `getKeyFor(method, keyRef, hint)`:
 *   1. the key/value store, looked up by `keyRef`;
 *   2. each registered resolver, in registration order — the first one that
 *      returns a non-null value wins.
 *
 * Key material is stored and returned as-is (raw `Uint8Array`, base64 string
 * or `CryptoKey`); interpreting it is the encryption method's responsibility.
 */
class Keyring {
  /**
   * @param {Object<string, (Uint8Array|string|CryptoKey)>} [keys] initial keyRef → material map.
   */
  constructor (keys = {}) {
    this._store = new Map();
    if (keys != null) {
      for (const keyRef of Object.keys(keys)) {
        this._store.set(keyRef, keys[keyRef]);
      }
    }
    this._resolvers = [];
  }

  /**
   * Add or replace a key in the store.
   * @param {string} keyRef
   * @param {Uint8Array|string|CryptoKey} material
   * @returns {Keyring} this, for chaining.
   */
  set (keyRef, material) {
    this._store.set(keyRef, material);
    return this;
  }

  /**
   * Register an asynchronous resolver, tried after the store misses.
   * @param {(method: string, keyRef: ?string, hint: *) => Promise<?(Uint8Array|string|CryptoKey)>} resolver
   * @returns {Keyring} this, for chaining.
   */
  use (resolver) {
    if (typeof resolver !== 'function') {
      throw new Error('Keyring.use() expects a function');
    }
    this._resolvers.push(resolver);
    return this;
  }

  /**
   * Resolve key material for a given method / keyRef / hint.
   * The store is consulted first, then each resolver in registration order.
   * @param {string} method
   * @param {?string} keyRef
   * @param {*} [hint]
   * @returns {Promise<?(Uint8Array|string|CryptoKey)>} resolved material, or null.
   */
  async getKeyFor (method, keyRef, hint) {
    if (keyRef != null && this._store.has(keyRef)) {
      return this._store.get(keyRef);
    }
    for (const resolver of this._resolvers) {
      const material = await resolver(method, keyRef, hint);
      if (material != null) return material;
    }
    return null;
  }
}

module.exports = Keyring;
