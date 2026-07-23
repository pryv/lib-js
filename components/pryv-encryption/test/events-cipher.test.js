/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect, beforeEach */

const { EventsCipher, Keyring } = require('../src');
const vector = require('./fixtures/aes-256-gcm.json');

const KEY_REF = 'journal-2026';

function newCipher (opts) {
  const keyring = new Keyring({ [KEY_REF]: vector.keyBase64 });
  return new EventsCipher(keyring, opts);
}

function plainEvent (over) {
  return Object.assign({
    id: 'evt-1',
    streamIds: ['journal'],
    time: 1500000000,
    created: 1500000000,
    createdBy: 'test',
    type: 'note/txt',
    content: 'a plaintext note'
  }, over);
}

describe('[ENCC] EventsCipher', function () {
  describe('[ENCCE] encryptEvent', function () {
    it('[ENCCEA] wraps type as encrypted/<method> and builds a payload content', async function () {
      const cipher = newCipher();
      const enc = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(enc.type).to.equal('encrypted/aes-256-gcm');
      expect(enc.content).to.have.property('payload').that.is.a('string');
      expect(enc.content).to.have.property('keyRef', KEY_REF);
    });

    it('[ENCCEB] passes non-content/type fields through as plaintext', async function () {
      const cipher = newCipher();
      const enc = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(enc.id).to.equal('evt-1');
      expect(enc.streamIds).to.deep.equal(['journal']);
      expect(enc.time).to.equal(1500000000);
      expect(enc.createdBy).to.equal('test');
    });

    it('[ENCCEC] includes hint only when provided; omits keyRef/hint when absent', async function () {
      const cipher = newCipher();
      const withHint = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF, hint: { kid: 1 } });
      expect(withHint.content.hint).to.deep.equal({ kid: 1 });

      // key resolvable via a resolver (no keyRef), so content should carry neither keyRef nor hint
      const keyring = new Keyring();
      keyring.use(async () => vector.keyBase64);
      const cipher2 = new EventsCipher(keyring);
      const noRefs = await cipher2.encryptEvent(plainEvent(), { method: 'aes-256-gcm' });
      expect(noRefs.content).to.not.have.property('keyRef');
      expect(noRefs.content).to.not.have.property('hint');
    });

    it('[ENCCED] does not mutate the input event', async function () {
      const cipher = newCipher();
      const input = plainEvent();
      const snapshot = JSON.parse(JSON.stringify(input));
      await cipher.encryptEvent(input, { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(input).to.deep.equal(snapshot);
    });

    it('[ENCCEE] throws on unknown method', async function () {
      const cipher = newCipher();
      await expect(cipher.encryptEvent(plainEvent(), { method: 'no-such', keyRef: KEY_REF }))
        .to.be.rejected;
    });

    it('[ENCCEF] throws when no key can be resolved', async function () {
      const cipher = newCipher();
      await expect(cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: 'unknown-ref' }))
        .to.be.rejected;
    });
  });

  describe('[ENCCU] encryptEventContent', function () {
    it('[ENCCUA] returns exactly { type: encrypted/<method>, content: { payload } }', async function () {
      const cipher = newCipher();
      const res = await cipher.encryptEventContent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(res).to.have.all.keys(['type', 'content']);
      expect(res.type).to.equal('encrypted/aes-256-gcm');
      expect(res.content).to.have.property('payload').that.is.a('string');
    });

    it('[ENCCUB] includes keyRef in content when provided', async function () {
      const cipher = newCipher();
      const res = await cipher.encryptEventContent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(res.content).to.have.property('keyRef', KEY_REF);
    });

    it('[ENCCUC] includes hint when provided; omits keyRef/hint when resolvable without refs', async function () {
      const cipher = newCipher();
      const withHint = await cipher.encryptEventContent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF, hint: { kid: 1 } });
      expect(withHint.content.hint).to.deep.equal({ kid: 1 });

      const keyring = new Keyring();
      keyring.use(async () => vector.keyBase64);
      const cipher2 = new EventsCipher(keyring);
      const noRefs = await cipher2.encryptEventContent(plainEvent(), { method: 'aes-256-gcm' });
      expect(noRefs.content).to.not.have.property('keyRef');
      expect(noRefs.content).to.not.have.property('hint');
    });

    it('[ENCCUD] does not mutate the input material', async function () {
      const cipher = newCipher();
      const input = plainEvent();
      const snapshot = JSON.parse(JSON.stringify(input));
      await cipher.encryptEventContent(input, { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(input).to.deep.equal(snapshot);
    });

    it('[ENCCUE] only carries type + content of the material into the ciphertext (envelope fields excluded)', async function () {
      const cipher = newCipher();
      const res = await cipher.encryptEventContent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      // assemble a synthetic event and decrypt: restored material must be just type/content
      const synthetic = { id: 'x', streamIds: ['s'], type: res.type, content: res.content };
      const dec = await cipher.decryptEvent(synthetic);
      expect(dec.type).to.equal('note/txt');
      expect(dec.content).to.equal('a plaintext note');
      // envelope-only fields of the ORIGINAL material must not have leaked into the payload
      expect(dec).to.not.have.property('createdBy', 'test-should-not-be-in-payload');
    });

    it('[ENCCUF] round-trips: a synthetic event assembled from the result decrypts back', async function () {
      const cipher = newCipher();
      const material = { type: 'note/txt', content: 'updated body' };
      const res = await cipher.encryptEventContent(material, { method: 'aes-256-gcm', keyRef: KEY_REF });
      const synthetic = { id: 'evt-9', streamIds: ['journal'], type: res.type, content: res.content };
      const dec = await cipher.decryptEvent(synthetic);
      expect(dec.type).to.equal('note/txt');
      expect(dec.content).to.equal('updated body');
      expect(dec.decryptedFrom).to.equal(synthetic);
    });

    it('[ENCCUG] throws on unknown method', async function () {
      const cipher = newCipher();
      await expect(cipher.encryptEventContent(plainEvent(), { method: 'no-such', keyRef: KEY_REF }))
        .to.be.rejected;
    });

    it('[ENCCUH] throws when the method is decrypt-only', async function () {
      const cipher = newCipher();
      cipher.registerMethod('read-only', {
        decrypt: async (content, key) => JSON.parse(content.payload)
      });
      await expect(cipher.encryptEventContent(plainEvent(), { method: 'read-only', keyRef: KEY_REF }))
        .to.be.rejected;
    });

    it('[ENCCUI] throws when no key can be resolved', async function () {
      const cipher = newCipher();
      await expect(cipher.encryptEventContent(plainEvent(), { method: 'aes-256-gcm', keyRef: 'unknown-ref' }))
        .to.be.rejected;
    });
  });

  describe('[ENCCD] decryptEvent', function () {
    let cipher;
    let encrypted;
    beforeEach(async function () {
      cipher = newCipher();
      encrypted = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
    });

    it('[ENCCDA] decrypts to a NEW object with restored type/content + decryptedFrom', async function () {
      const out = await cipher.decryptEvent(encrypted);
      expect(out).to.not.equal(encrypted);
      expect(out.type).to.equal('note/txt');
      expect(out.content).to.equal('a plaintext note');
      expect(out.decryptedFrom).to.equal(encrypted);
    });

    it('[ENCCDB] preserves envelope fields from the encrypted event', async function () {
      const out = await cipher.decryptEvent(encrypted);
      expect(out.id).to.equal('evt-1');
      expect(out.streamIds).to.deep.equal(['journal']);
      expect(out.time).to.equal(1500000000);
      expect(out.createdBy).to.equal('test');
    });

    it('[ENCCDC] does not mutate the original encrypted event', async function () {
      const snapshot = JSON.parse(JSON.stringify(encrypted));
      await cipher.decryptEvent(encrypted);
      expect(encrypted).to.deep.equal(snapshot);
    });

    it('[ENCCDD] returns the SAME reference when type is not encrypted/<method>', async function () {
      const ev = plainEvent();
      const out = await cipher.decryptEvent(ev);
      expect(out).to.equal(ev);
    });

    it('[ENCCDE] returns the SAME reference when method is not registered', async function () {
      const ev = plainEvent({ type: 'encrypted/unregistered-method', content: { payload: 'x' } });
      const out = await cipher.decryptEvent(ev);
      expect(out).to.equal(ev);
    });

    it('[ENCCDF] no key found: returns SAME ref, calls onDecryptError, never throws', async function () {
      const errors = [];
      const keyring = new Keyring(); // empty store, no resolvers
      const c = new EventsCipher(keyring, { onDecryptError: (event, error) => errors.push({ event, error }) });
      const out = await c.decryptEvent(encrypted);
      expect(out).to.equal(encrypted);
      expect(errors).to.have.length(1);
      expect(errors[0].event).to.equal(encrypted);
      expect(errors[0].error).to.be.instanceOf(Error);
    });

    it('[ENCCDG] resolver that throws: returns SAME ref, calls onDecryptError, never throws', async function () {
      const errors = [];
      const keyring = new Keyring();
      keyring.use(async () => { throw new Error('resolver boom'); });
      const c = new EventsCipher(keyring, { onDecryptError: (event, error) => errors.push(error) });
      const out = await c.decryptEvent(encrypted);
      expect(out).to.equal(encrypted);
      expect(errors).to.have.length(1);
    });

    it('[ENCCDH] wrong key: returns SAME ref, calls onDecryptError', async function () {
      const errors = [];
      const keyring = new Keyring({ [KEY_REF]: 'BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU=' });
      const c = new EventsCipher(keyring, { onDecryptError: () => errors.push(1) });
      const out = await c.decryptEvent(encrypted);
      expect(out).to.equal(encrypted);
      expect(errors).to.have.length(1);
    });

    it('[ENCCDI] malformed payload: returns SAME ref', async function () {
      const bad = plainEvent({ type: 'encrypted/aes-256-gcm', content: { payload: 'not-a-valid-payload', keyRef: KEY_REF } });
      const out = await cipher.decryptEvent(bad);
      expect(out).to.equal(bad);
    });

    it('[ENCCDJ] decrypted material lacking type/content: returns SAME ref', async function () {
      // encrypt an event whose type is missing -> decrypted material won't carry `type`
      const halfPlain = { id: 'h1', streamIds: ['s'], content: 'no type here' };
      const enc = await cipher.encryptEvent(halfPlain, { method: 'aes-256-gcm', keyRef: KEY_REF });
      const errors = [];
      const c = newCipher({ onDecryptError: () => errors.push(1) });
      const out = await c.decryptEvent(enc);
      expect(out).to.equal(enc);
      expect(errors).to.have.length(1);
    });

    it('[ENCCDK] default onDecryptError is silent (no throw)', async function () {
      const keyring = new Keyring();
      const c = new EventsCipher(keyring);
      const out = await c.decryptEvent(encrypted);
      expect(out).to.equal(encrypted);
    });
  });

  describe('[ENCCB] batch + streaming helpers', function () {
    it('[ENCCBA] decryptEvents maps an array, decrypting matching events', async function () {
      const cipher = newCipher();
      const enc = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      const plain = plainEvent({ id: 'evt-2' });
      const out = await cipher.decryptEvents([enc, plain]);
      expect(out).to.have.length(2);
      expect(out[0].type).to.equal('note/txt');
      expect(out[0].decryptedFrom).to.equal(enc);
      expect(out[1]).to.equal(plain); // untouched
    });

    it('[ENCCBB] wrapForEachEvent decrypts then forwards to the user callback', async function () {
      const cipher = newCipher();
      const enc = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      const seen = [];
      const wrapped = cipher.wrapForEachEvent((event) => seen.push(event));
      await wrapped(enc);
      expect(seen).to.have.length(1);
      expect(seen[0].type).to.equal('note/txt');
      expect(seen[0].decryptedFrom).to.equal(enc);
    });
  });

  describe('[ENCCS] stripDecrypted', function () {
    it('[ENCCSA] returns the original encrypted event for a decrypted one', async function () {
      const cipher = newCipher();
      const enc = await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      const dec = await cipher.decryptEvent(enc);
      expect(cipher.stripDecrypted(dec)).to.equal(enc);
    });

    it('[ENCCSB] returns the event itself when it was not decrypted', function () {
      const cipher = newCipher();
      const ev = plainEvent();
      expect(cipher.stripDecrypted(ev)).to.equal(ev);
    });
  });

  describe('[ENCCM] registerMethod', function () {
    it('[ENCCMA] registers a custom method usable for encrypt + decrypt', async function () {
      const keyring = new Keyring({ [KEY_REF]: 'passthrough' });
      const cipher = new EventsCipher(keyring);
      // a trivial (insecure, test-only) method that base64-JSONs the material
      cipher.registerMethod('plain-json', {
        encrypt: async (material, key) => ({ payload: JSON.stringify(material) }),
        decrypt: async (content, key) => JSON.parse(content.payload)
      });
      const enc = await cipher.encryptEvent(plainEvent(), { method: 'plain-json', keyRef: KEY_REF });
      expect(enc.type).to.equal('encrypted/plain-json');
      const dec = await cipher.decryptEvent(enc);
      expect(dec.type).to.equal('note/txt');
      expect(dec.content).to.equal('a plaintext note');
    });

    it('[ENCCMC] accepts a decrypt-only method (no encrypt)', async function () {
      const cipher = newCipher();
      cipher.registerMethod('read-only', {
        decrypt: async (content, key) => JSON.parse(content.payload)
      });
      const ev = plainEvent({
        type: 'encrypted/read-only',
        content: { payload: JSON.stringify({ type: 'note/txt', content: 'decoded' }), keyRef: KEY_REF }
      });
      const dec = await cipher.decryptEvent(ev);
      expect(dec.type).to.equal('note/txt');
      expect(dec.content).to.equal('decoded');
    });

    it('[ENCCMD] encryptEvent with a decrypt-only method throws', async function () {
      const cipher = newCipher();
      cipher.registerMethod('read-only', {
        decrypt: async (content, key) => JSON.parse(content.payload)
      });
      await expect(cipher.encryptEvent(plainEvent(), { method: 'read-only', keyRef: KEY_REF }))
        .to.be.rejected;
    });

    it('[ENCCMB] can override a built-in method', async function () {
      const cipher = newCipher();
      let used = false;
      cipher.registerMethod('aes-256-gcm', {
        encrypt: async (material) => { used = true; return { payload: JSON.stringify(material) }; },
        decrypt: async (content) => JSON.parse(content.payload)
      });
      await cipher.encryptEvent(plainEvent(), { method: 'aes-256-gcm', keyRef: KEY_REF });
      expect(used).to.equal(true);
    });
  });
});
