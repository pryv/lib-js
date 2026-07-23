/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const { Keyring } = require('../src');

describe('[ENCK] Keyring', function () {
  describe('[ENCKV] key/value store', function () {
    it('[ENCKVA] returns a key stored under its keyRef', async function () {
      const material = new Uint8Array(32).fill(7);
      const keyring = new Keyring({ 'journal-2026': material });
      const found = await keyring.getKeyFor('aes-256-gcm', 'journal-2026', undefined);
      expect(found).to.equal(material);
    });

    it('[ENCKVB] returns null when the keyRef is unknown and no resolvers set', async function () {
      const keyring = new Keyring({ 'journal-2026': new Uint8Array(32) });
      const found = await keyring.getKeyFor('aes-256-gcm', 'nope', undefined);
      expect(found).to.equal(null);
    });

    it('[ENCKVC] can be constructed empty', async function () {
      const keyring = new Keyring();
      const found = await keyring.getKeyFor('aes-256-gcm', 'anything', undefined);
      expect(found).to.equal(null);
    });

    it('[ENCKVD] set() adds a key to the store', async function () {
      const keyring = new Keyring();
      const material = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
      keyring.set('later', material);
      const found = await keyring.getKeyFor('aes-256-gcm', 'later', undefined);
      expect(found).to.equal(material);
    });
  });

  describe('[ENCKR] resolver chain', function () {
    it('[ENCKRA] falls back to resolvers when the store misses', async function () {
      const keyring = new Keyring();
      const material = new Uint8Array(32).fill(3);
      keyring.use(async (method, keyRef, hint) => (keyRef === 'remote' ? material : null));
      const found = await keyring.getKeyFor('aes-256-gcm', 'remote', undefined);
      expect(found).to.equal(material);
    });

    it('[ENCKRB] tries resolvers in registration order, first non-null wins', async function () {
      const keyring = new Keyring();
      const order = [];
      const first = new Uint8Array(32).fill(1);
      keyring.use(async () => { order.push('a'); return null; });
      keyring.use(async () => { order.push('b'); return first; });
      keyring.use(async () => { order.push('c'); return new Uint8Array(32).fill(2); });
      const found = await keyring.getKeyFor('aes-256-gcm', 'x', undefined);
      expect(found).to.equal(first);
      expect(order).to.deep.equal(['a', 'b']); // 'c' never reached
    });

    it('[ENCKRC] store takes precedence over resolvers', async function () {
      const stored = new Uint8Array(32).fill(5);
      const keyring = new Keyring({ known: stored });
      let resolverCalled = false;
      keyring.use(async () => { resolverCalled = true; return new Uint8Array(32); });
      const found = await keyring.getKeyFor('aes-256-gcm', 'known', undefined);
      expect(found).to.equal(stored);
      expect(resolverCalled).to.equal(false);
    });

    it('[ENCKRD] passes method, keyRef and hint through to resolvers', async function () {
      const keyring = new Keyring();
      let seen = null;
      keyring.use(async (method, keyRef, hint) => { seen = { method, keyRef, hint }; return null; });
      await keyring.getKeyFor('my-method', 'ref-1', { kid: 42 });
      expect(seen).to.deep.equal({ method: 'my-method', keyRef: 'ref-1', hint: { kid: 42 } });
    });

    it('[ENCKRE] returns null when every resolver returns null', async function () {
      const keyring = new Keyring();
      keyring.use(async () => null);
      keyring.use(async () => null);
      const found = await keyring.getKeyFor('aes-256-gcm', 'x', undefined);
      expect(found).to.equal(null);
    });

    it('[ENCKRF] use() returns the keyring for chaining', function () {
      const keyring = new Keyring();
      expect(keyring.use(async () => null)).to.equal(keyring);
    });
  });
});
