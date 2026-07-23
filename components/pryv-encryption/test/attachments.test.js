/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect */

const aes = require('../src/methods/aes-256-gcm');
const ecies = require('../src/methods/ecies-aes-256-gcm');
const { EventsCipher, Keyring } = require('../src');
const { base64ToBytes } = require('../src/lib/base64');
const aesVector = require('./fixtures/aes-256-gcm.json');
const eciesFixture = require('./fixtures/ecies-aes-256-gcm.json');

/**
 * Fill a Uint8Array of the requested length with random bytes, chunked to stay
 * within the 65 536-byte-per-call quota of `crypto.getRandomValues`.
 */
function randomBytes (n) {
  const bytes = new Uint8Array(n);
  for (let offset = 0; offset < n; offset += 65536) {
    globalThis.crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + 65536, n)));
  }
  return bytes;
}

/** Deep-equal comparison of two byte arrays (as plain arrays for a clear diff). */
function sameBytes (a, b) {
  expect(Array.from(a)).to.deep.equal(Array.from(b));
}

async function expectThrows (promiseFactory) {
  let threw = false;
  try { await promiseFactory(); } catch (e) { threw = true; }
  expect(threw).to.equal(true);
}

const AES_KEY = aesVector.keyBase64;
const BIG = 100 * 1024; // ~100 KB

describe('[ENCF] encrypted attachments (raw-byte primitives)', function () {
  this.timeout(20000);

  // A pair holding BOTH sides of the fixed ecies recipient so a single keyRef
  // resolves for encrypt (public) and decrypt (private).
  const eciesPair = { publicKey: eciesFixture.recipient.publicKey, privateKey: eciesFixture.recipient.privateKey };

  describe('[ENCFB] aes-256-gcm byte primitives', function () {
    it('[ENCFBA] round-trips random bytes', async function () {
      const bytes = randomBytes(1234);
      const enc = await aes.encryptBytes(bytes, AES_KEY);
      expect(enc).to.be.an.instanceOf(Uint8Array);
      const back = await aes.decryptBytes(enc, AES_KEY);
      sameBytes(back, bytes);
    });

    it('[ENCFBB] round-trips empty bytes', async function () {
      const bytes = new Uint8Array(0);
      const enc = await aes.encryptBytes(bytes, AES_KEY);
      const back = await aes.decryptBytes(enc, AES_KEY);
      sameBytes(back, bytes);
    });

    it('[ENCFBC] round-trips ~100 KB', async function () {
      const bytes = randomBytes(BIG);
      const enc = await aes.encryptBytes(bytes, AES_KEY);
      const back = await aes.decryptBytes(enc, AES_KEY);
      sameBytes(back, bytes);
    });

    it('[ENCFBD] does not mutate the input bytes', async function () {
      const bytes = randomBytes(64);
      const copy = bytes.slice();
      await aes.encryptBytes(bytes, AES_KEY);
      sameBytes(bytes, copy);
    });

    it('[ENCFBE] tampered ciphertext rejects', async function () {
      const enc = await aes.encryptBytes(randomBytes(64), AES_KEY);
      enc[enc.length - 1] ^= 0xff;
      await expectThrows(() => aes.decryptBytes(enc, AES_KEY));
    });

    it('[ENCFBF] truncated bytes reject', async function () {
      const enc = await aes.encryptBytes(randomBytes(64), AES_KEY);
      await expectThrows(() => aes.decryptBytes(enc.slice(0, 8), AES_KEY));
    });

    it('[ENCFBG] wrong key rejects', async function () {
      const enc = await aes.encryptBytes(randomBytes(64), AES_KEY);
      const wrong = new Uint8Array(32).fill(9);
      await expectThrows(() => aes.decryptBytes(enc, wrong));
    });
  });

  describe('[ENCFE] ecies-aes-256-gcm byte primitives', function () {
    const pub = eciesFixture.recipient.publicKey;
    const priv = eciesFixture.recipient.privateKey;

    it('[ENCFEA] round-trips random bytes', async function () {
      const bytes = randomBytes(2048);
      const enc = await ecies.encryptBytes(bytes, pub);
      expect(enc).to.be.an.instanceOf(Uint8Array);
      const back = await ecies.decryptBytes(enc, priv);
      sameBytes(back, bytes);
    });

    it('[ENCFEB] round-trips empty bytes', async function () {
      const bytes = new Uint8Array(0);
      const enc = await ecies.encryptBytes(bytes, pub);
      const back = await ecies.decryptBytes(enc, priv);
      sameBytes(back, bytes);
    });

    it('[ENCFEC] round-trips ~100 KB', async function () {
      const bytes = randomBytes(BIG);
      const enc = await ecies.encryptBytes(bytes, pub);
      const back = await ecies.decryptBytes(enc, priv);
      sameBytes(back, bytes);
    });

    it('[ENCFED] tampered / truncated / wrong-key reject', async function () {
      const enc = await ecies.encryptBytes(randomBytes(64), pub);
      const tampered = enc.slice();
      tampered[tampered.length - 1] ^= 0xff;
      await expectThrows(() => ecies.decryptBytes(tampered, priv));
      await expectThrows(() => ecies.decryptBytes(enc.slice(0, 10), priv));
      const other = await ecies.generateKeyPair();
      await expectThrows(() => ecies.decryptBytes(enc, other.privateKey));
    });
  });

  describe('[ENCFC] cross-consistency: payload === base64(encryptBytes)', function () {
    it('[ENCFCA] aes: decryptBytes(base64ToBytes(payload)) yields the UTF-8 JSON bytes', async function () {
      const material = { type: 'note/txt', content: 'cross check' };
      const content = await aes.encrypt(material, AES_KEY);
      const plainBytes = await aes.decryptBytes(base64ToBytes(content.payload), AES_KEY);
      const expected = new TextEncoder().encode(JSON.stringify(material));
      sameBytes(plainBytes, expected);
    });

    it('[ENCFCB] ecies: decryptBytes(base64ToBytes(payload)) yields the UTF-8 JSON bytes', async function () {
      const material = { type: 'note/txt', content: 'cross check' };
      const content = await ecies.encrypt(material, eciesFixture.recipient.publicKey);
      const plainBytes = await ecies.decryptBytes(base64ToBytes(content.payload), eciesFixture.recipient.privateKey);
      const expected = new TextEncoder().encode(JSON.stringify(material));
      sameBytes(plainBytes, expected);
    });
  });

  describe('[ENCFH] EventsCipher attachment helpers', function () {
    const AES_REF = 'att-key';
    const ECIES_REF = 'att-recipient';
    let aesCipher;
    let eciesCipher;

    before(function () {
      aesCipher = new EventsCipher(new Keyring({ [AES_REF]: AES_KEY }));
      eciesCipher = new EventsCipher(new Keyring({ [ECIES_REF]: eciesPair }));
    });

    it('[ENCFHA] aes: encryptAttachmentData -> decryptAttachmentData round-trips', async function () {
      const bytes = randomBytes(4096);
      const enc = await aesCipher.encryptAttachmentData(bytes, { method: 'aes-256-gcm', keyRef: AES_REF });
      expect(enc).to.be.an.instanceOf(Uint8Array);
      const event = await aesCipher.encryptEvent({ type: 'note/txt', content: 'x' }, { method: 'aes-256-gcm', keyRef: AES_REF });
      const back = await aesCipher.decryptAttachmentData(event, enc);
      sameBytes(back, bytes);
    });

    it('[ENCFHB] ecies: encryptAttachmentData -> decryptAttachmentData round-trips', async function () {
      const bytes = randomBytes(4096);
      const enc = await eciesCipher.encryptAttachmentData(bytes, { method: 'ecies-aes-256-gcm', keyRef: ECIES_REF });
      const event = await eciesCipher.encryptEvent({ type: 'note/txt', content: 'x' }, { method: 'ecies-aes-256-gcm', keyRef: ECIES_REF });
      const back = await eciesCipher.decryptAttachmentData(event, enc);
      sameBytes(back, bytes);
    });

    it('[ENCFHC] decryptAttachmentData accepts an already-decrypted event (unwrap path)', async function () {
      const bytes = randomBytes(512);
      const enc = await aesCipher.encryptAttachmentData(bytes, { method: 'aes-256-gcm', keyRef: AES_REF });
      const event = await aesCipher.encryptEvent({ type: 'note/txt', content: 'x' }, { method: 'aes-256-gcm', keyRef: AES_REF });
      const decryptedEvent = await aesCipher.decryptEvent(event);
      expect(decryptedEvent.decryptedFrom).to.equal(event); // sanity: it is the unwrapped form
      const back = await aesCipher.decryptAttachmentData(decryptedEvent, enc);
      sameBytes(back, bytes);
    });

    it('[ENCFHD] does not mutate the input bytes', async function () {
      const bytes = randomBytes(64);
      const copy = bytes.slice();
      await aesCipher.encryptAttachmentData(bytes, { method: 'aes-256-gcm', keyRef: AES_REF });
      sameBytes(bytes, copy);
    });

    it('[ENCFHE] legacy method has no byte support -> throws', async function () {
      const ring = new Keyring({ legacy: 'passphrase' });
      const cipher = new EventsCipher(ring);
      await expectThrows(() => cipher.encryptAttachmentData(randomBytes(16), { method: 'aes-text-base64', keyRef: 'legacy' }));
      const legacyEvent = { type: 'encrypted/aes-text-base64', content: { payload: 'x', keyRef: 'legacy' } };
      await expectThrows(() => cipher.decryptAttachmentData(legacyEvent, randomBytes(16)));
    });

    it('[ENCFHF] unknown method throws', async function () {
      await expectThrows(() => aesCipher.encryptAttachmentData(randomBytes(16), { method: 'nope', keyRef: AES_REF }));
      const badEvent = { type: 'encrypted/nope', content: { payload: 'x' } };
      await expectThrows(() => aesCipher.decryptAttachmentData(badEvent, randomBytes(16)));
    });

    it('[ENCFHG] missing key throws', async function () {
      const cipher = new EventsCipher(new Keyring());
      await expectThrows(() => cipher.encryptAttachmentData(randomBytes(16), { method: 'aes-256-gcm', keyRef: 'absent' }));
      const event = { type: 'encrypted/aes-256-gcm', content: { payload: 'x', keyRef: 'absent' } };
      await expectThrows(() => cipher.decryptAttachmentData(event, randomBytes(16)));
    });

    it('[ENCFHH] non-encrypted event throws on decrypt', async function () {
      const plainEvent = { type: 'note/txt', content: 'plain' };
      await expectThrows(() => aesCipher.decryptAttachmentData(plainEvent, randomBytes(16)));
    });

    it('[ENCFHI] a custom method may provide byte primitives', async function () {
      // Identity "cipher" — enough to exercise the registration + validation path.
      const custom = {
        encrypt: async (m) => ({ payload: 'noop' }),
        decrypt: async () => ({ type: 'note/txt', content: 'noop' }),
        encryptBytes: async (bytes) => bytes,
        decryptBytes: async (bytes) => bytes
      };
      const ring = new Keyring({ k: 'anything' });
      const cipher = new EventsCipher(ring).registerMethod('passthrough', custom);
      const bytes = randomBytes(32);
      const enc = await cipher.encryptAttachmentData(bytes, { method: 'passthrough', keyRef: 'k' });
      const event = { type: 'encrypted/passthrough', content: { keyRef: 'k' } };
      const back = await cipher.decryptAttachmentData(event, enc);
      sameBytes(back, bytes);
    });

    it('[ENCFHJ] registerMethod rejects a non-function encryptBytes/decryptBytes', function () {
      const cipher = new EventsCipher(new Keyring());
      expect(() => cipher.registerMethod('bad', { decrypt: async () => {}, encryptBytes: 123 })).to.throw();
      expect(() => cipher.registerMethod('bad', { decrypt: async () => {}, decryptBytes: 'x' })).to.throw();
    });
  });
});
