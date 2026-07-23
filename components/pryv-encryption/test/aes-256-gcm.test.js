/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const aes = require('../src/methods/aes-256-gcm');
const { base64ToBytes, bytesToBase64 } = require('../src/lib/base64');
const vector = require('./fixtures/aes-256-gcm.json');

describe('[ENCA] aes-256-gcm method', function () {
  describe('[ENCAV] fixed test vector', function () {
    it('[ENCAVA] payload byte-layout matches iv || subtle-ciphertext (deterministic vector)', async function () {
      // Rebuild the payload independently, with the SAME fixed key + IV, using raw
      // WebCrypto — proves the committed vector is byte-exact and format-stable.
      const keyBytes = base64ToBytes(vector.keyBase64);
      const iv = base64ToBytes(vector.ivBase64);
      const key = await globalThis.crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
      const pt = new TextEncoder().encode(vector.plaintextJson);
      const cipherBuf = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt);
      const cipherBytes = new Uint8Array(cipherBuf);
      const out = new Uint8Array(iv.length + cipherBytes.length);
      out.set(iv, 0);
      out.set(cipherBytes, iv.length);
      expect(bytesToBase64(out)).to.equal(vector.payload);
    });

    it('[ENCAVB] decrypt() of the committed vector yields the exact plaintext object', async function () {
      const material = await aes.decrypt({ payload: vector.payload }, vector.keyBase64);
      expect(material).to.deep.equal(vector.plaintextObject);
    });
  });

  describe('[ENCAR] round-trips (random IV)', function () {
    const rawKey = base64ToBytes(vector.keyBase64);

    it('[ENCARA] encrypt then decrypt returns the original material (Uint8Array key)', async function () {
      const material = { type: 'note/txt', content: 'round trip', extra: [1, 2, 3] };
      const content = await aes.encrypt(material, rawKey);
      expect(content).to.have.property('payload').that.is.a('string');
      const back = await aes.decrypt(content, rawKey);
      expect(back).to.deep.equal(material);
    });

    it('[ENCARB] two encryptions of the same material produce different payloads (random IV)', async function () {
      const material = { type: 'note/txt', content: 'nonce check' };
      const a = await aes.encrypt(material, rawKey);
      const b = await aes.encrypt(material, rawKey);
      expect(a.payload).to.not.equal(b.payload);
    });

    it('[ENCARC] accepts a base64 string key', async function () {
      const material = { type: 'note/txt', content: 'string key' };
      const content = await aes.encrypt(material, vector.keyBase64);
      const back = await aes.decrypt(content, vector.keyBase64);
      expect(back).to.deep.equal(material);
    });

    it('[ENCARD] accepts a CryptoKey', async function () {
      const cryptoKey = await globalThis.crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
      const material = { type: 'note/txt', content: 'crypto key' };
      const content = await aes.encrypt(material, cryptoKey);
      const back = await aes.decrypt(content, cryptoKey);
      expect(back).to.deep.equal(material);
    });
  });

  describe('[ENCAN] negative cases (must reject)', function () {
    const rawKey = base64ToBytes(vector.keyBase64);

    it('[ENCANA] wrong key fails authentication', async function () {
      const wrong = new Uint8Array(32).fill(9);
      let threw = false;
      try {
        await aes.decrypt({ payload: vector.payload }, wrong);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCANB] truncated payload rejects', async function () {
      const truncated = vector.payload.slice(0, 20);
      let threw = false;
      try {
        await aes.decrypt({ payload: truncated }, rawKey);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCANC] corrupted auth tag rejects', async function () {
      const bytes = base64ToBytes(vector.payload);
      bytes[bytes.length - 1] ^= 0xff; // flip the last tag byte
      let threw = false;
      try {
        await aes.decrypt({ payload: bytesToBase64(bytes) }, rawKey);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCAND] key of wrong length rejects', async function () {
      const short = new Uint8Array(16).fill(1);
      let threw = false;
      try {
        await aes.encrypt({ type: 'a', content: 'b' }, short);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });
  });
});
