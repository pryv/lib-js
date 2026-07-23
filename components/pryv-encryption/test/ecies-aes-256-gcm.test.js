/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect */

const ecies = require('../src/methods/ecies-aes-256-gcm');
const { EventsCipher, Keyring } = require('../src');
const { base64ToBytes, bytesToBase64 } = require('../src/lib/base64');
const fixture = require('./fixtures/ecies-aes-256-gcm.json');

const subtle = globalThis.crypto.subtle;

// Various encodings of the fixed recipient key, prepared once.
let rawPubBytes; // Uint8Array, 65-byte SEC1 uncompressed public key
let rawPubBase64;
let pkcs8Bytes; // Uint8Array, PKCS#8 private key
let pkcs8Base64;
let pubCryptoKey; // ECDH public CryptoKey
let privCryptoKey; // ECDH private CryptoKey

before(async function () {
  pubCryptoKey = await subtle.importKey('jwk', fixture.recipient.publicKey, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
  privCryptoKey = await subtle.importKey('jwk', fixture.recipient.privateKey, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  rawPubBytes = new Uint8Array(await subtle.exportKey('raw', pubCryptoKey));
  rawPubBase64 = bytesToBase64(rawPubBytes);
  pkcs8Bytes = new Uint8Array(await subtle.exportKey('pkcs8', privCryptoKey));
  pkcs8Base64 = bytesToBase64(pkcs8Bytes);
});

describe('[ENCP] ecies-aes-256-gcm (asymmetric)', function () {
  describe('[ENCPV] known-answer decrypt vector', function () {
    it('[ENCPVA] decrypts the committed vector byte-exactly (JWK private key)', async function () {
      const material = await ecies.decrypt({ payload: fixture.payload }, fixture.recipient.privateKey);
      expect(material).to.deep.equal(fixture.plaintextObject);
    });
  });

  describe('[ENCPG] generateKeyPair + full cycle', function () {
    it('[ENCPGA] mint -> encrypt(public) -> decrypt(private) round-trips', async function () {
      const pair = await ecies.generateKeyPair();
      expect(pair.publicKey).to.have.property('kty', 'EC');
      expect(pair.privateKey).to.have.property('d');
      const material = { type: 'note/txt', content: 'minted round trip' };
      const content = await ecies.encrypt(material, pair.publicKey);
      expect(content).to.have.property('payload').that.is.a('string');
      const back = await ecies.decrypt(content, pair.privateKey);
      expect(back).to.deep.equal(material);
    });

    it('[ENCPGB] two encryptions of the same material differ (random ephemeral + IV)', async function () {
      const material = { type: 'note/txt', content: 'nonce check' };
      const a = await ecies.encrypt(material, fixture.recipient.publicKey);
      const b = await ecies.encrypt(material, fixture.recipient.publicKey);
      expect(a.payload).to.not.equal(b.payload);
    });
  });

  describe('[ENCPR] round-trips across key-material shapes', function () {
    const material = { type: 'mass/kg', content: { value: 7 } };

    it('[ENCPRA] JWK public -> JWK private', async function () {
      const c = await ecies.encrypt(material, fixture.recipient.publicKey);
      const back = await ecies.decrypt(c, fixture.recipient.privateKey);
      expect(back).to.deep.equal(material);
    });

    it('[ENCPRB] CryptoKey public -> CryptoKey private', async function () {
      const c = await ecies.encrypt(material, pubCryptoKey);
      const back = await ecies.decrypt(c, privCryptoKey);
      expect(back).to.deep.equal(material);
    });

    it('[ENCPRC] raw 65-byte public (Uint8Array) -> PKCS#8 private (Uint8Array)', async function () {
      const c = await ecies.encrypt(material, rawPubBytes);
      const back = await ecies.decrypt(c, pkcs8Bytes);
      expect(back).to.deep.equal(material);
    });

    it('[ENCPRD] raw public (base64) -> PKCS#8 private (base64)', async function () {
      const c = await ecies.encrypt(material, rawPubBase64);
      const back = await ecies.decrypt(c, pkcs8Base64);
      expect(back).to.deep.equal(material);
    });

    it('[ENCPRE] pair object -> pair object (each side picked by usage)', async function () {
      const pair = { publicKey: fixture.recipient.publicKey, privateKey: fixture.recipient.privateKey };
      const c = await ecies.encrypt(material, pair);
      const back = await ecies.decrypt(c, pair);
      expect(back).to.deep.equal(material);
    });

    it('[ENCPRF] pair object of CryptoKeys', async function () {
      const pair = { publicKey: pubCryptoKey, privateKey: privCryptoKey };
      const c = await ecies.encrypt(material, pair);
      const back = await ecies.decrypt(c, pair);
      expect(back).to.deep.equal(material);
    });
  });

  describe('[ENCPK] normalizeKey', function () {
    it('[ENCPKA] usage=encrypt accepts JWK public, CryptoKey, raw bytes, base64, pair', async function () {
      for (const m of [fixture.recipient.publicKey, pubCryptoKey, rawPubBytes, rawPubBase64,
        { publicKey: fixture.recipient.publicKey }]) {
        const k = await ecies.normalizeKey(m, 'encrypt');
        expect(k).to.be.an.instanceOf(CryptoKey);
        expect(k.type).to.equal('public');
      }
    });

    it('[ENCPKB] usage=decrypt accepts JWK private, CryptoKey, PKCS#8 bytes, base64, pair', async function () {
      for (const m of [fixture.recipient.privateKey, privCryptoKey, pkcs8Bytes, pkcs8Base64,
        { privateKey: fixture.recipient.privateKey }]) {
        const k = await ecies.normalizeKey(m, 'decrypt');
        expect(k).to.be.an.instanceOf(CryptoKey);
        expect(k.type).to.equal('private');
      }
    });

    it('[ENCPKC] throws on null/unsupported material', async function () {
      let threw = false;
      try { await ecies.normalizeKey(null, 'encrypt'); } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCPKD] throws on unknown usage', async function () {
      let threw = false;
      try { await ecies.normalizeKey(fixture.recipient.publicKey, 'sign'); } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });
  });

  describe('[ENCPN] negative cases (must reject)', function () {
    it('[ENCPNA] wrong private key fails authentication', async function () {
      const other = await ecies.generateKeyPair();
      let threw = false;
      try {
        await ecies.decrypt({ payload: fixture.payload }, other.privateKey);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCPNB] tampered tag fails', async function () {
      const bytes = base64ToBytes(fixture.payload);
      bytes[bytes.length - 1] ^= 0xff;
      let threw = false;
      try {
        await ecies.decrypt({ payload: bytesToBase64(bytes) }, fixture.recipient.privateKey);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCPNC] truncated payload fails', async function () {
      const truncated = fixture.payload.slice(0, 40);
      let threw = false;
      try {
        await ecies.decrypt({ payload: truncated }, fixture.recipient.privateKey);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCPND] missing payload throws', async function () {
      let threw = false;
      try { await ecies.decrypt({}, fixture.recipient.privateKey); } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });
  });

  describe('[ENCPC] via EventsCipher (sender/recipient split)', function () {
    it('[ENCPCA] encrypt with public key in one keyring -> decrypt with private key in a DIFFERENT keyring', async function () {
      const KEY_REF = 'recipient-alice';
      const senderRing = new Keyring({ [KEY_REF]: fixture.recipient.publicKey });
      const senderCipher = new EventsCipher(senderRing);
      const recipientRing = new Keyring({ [KEY_REF]: fixture.recipient.privateKey });
      const recipientCipher = new EventsCipher(recipientRing);

      const plain = { streamIds: ['shared'], type: 'note/txt', content: 'for alice only' };
      const enc = await senderCipher.encryptEvent(plain, { method: 'ecies-aes-256-gcm', keyRef: KEY_REF });
      expect(enc.type).to.equal('encrypted/ecies-aes-256-gcm');
      expect(enc.content).to.have.property('keyRef', KEY_REF);

      const dec = await recipientCipher.decryptEvent(enc);
      expect(dec.type).to.equal('note/txt');
      expect(dec.content).to.equal('for alice only');
      expect(dec.decryptedFrom).to.equal(enc);
    });

    it('[ENCPCB] decrypt failure (only public key available) falls back to the same ref', async function () {
      const KEY_REF = 'recipient-alice';
      const senderRing = new Keyring({ [KEY_REF]: fixture.recipient.publicKey });
      const senderCipher = new EventsCipher(senderRing);
      const plain = { streamIds: ['shared'], type: 'note/txt', content: 'no private key here' };
      const enc = await senderCipher.encryptEvent(plain, { method: 'ecies-aes-256-gcm', keyRef: KEY_REF });

      // The sender's keyring only holds the PUBLIC key, so decrypt cannot succeed.
      const errors = [];
      const cipher = new EventsCipher(senderRing, { onDecryptError: () => errors.push(1) });
      const out = await cipher.decryptEvent(enc);
      expect(out).to.equal(enc);
      expect(errors).to.have.length(1);
    });
  });
});
