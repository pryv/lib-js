/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const aesText = require('../src/methods/aes-text-base64');
const { EventsCipher, Keyring } = require('../src');
const { base64ToBytes, bytesToBase64 } = require('../src/lib/base64');
const fixture = require('./fixtures/aes-text-base64.json');

describe('[ENCL] aes-text-base64 (legacy, decrypt-only)', function () {
  describe('[ENCLV] known-answer vectors', function () {
    fixture.vectors.forEach(function (vec, i) {
      it(`[ENCLV${i}] vector ${i} decrypts to the exact material object`, async function () {
        const material = await aesText.decrypt({ payload: vec.payload }, vec.passphrase);
        expect(material).to.deep.equal(vec.plaintextObject);
      });
    });
  });

  describe('[ENCLN] negative cases (must reject)', function () {
    const vec = fixture.vectors[0];

    it('[ENCLNA] wrong passphrase throws', async function () {
      let threw = false;
      try {
        await aesText.decrypt({ payload: vec.payload }, 'not the passphrase');
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCLNB] missing Salted__ prefix throws', async function () {
      // Re-base64 the payload bytes with the 8-byte "Salted__" magic stripped.
      const bytes = base64ToBytes(vec.payload);
      const noMagic = bytes.slice(8);
      let threw = false;
      try {
        await aesText.decrypt({ payload: bytesToBase64(noMagic) }, vec.passphrase);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCLNC] truncated payload throws', async function () {
      const truncated = vec.payload.slice(0, 24);
      let threw = false;
      try {
        await aesText.decrypt({ payload: truncated }, vec.passphrase);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });

    it('[ENCLND] missing payload throws', async function () {
      let threw = false;
      try {
        await aesText.decrypt({}, vec.passphrase);
      } catch (e) { threw = true; }
      expect(threw).to.equal(true);
    });
  });

  describe('[ENCLC] via EventsCipher', function () {
    const vec = fixture.vectors[0];
    const KEY_REF = 'legacy-passphrase';

    it('[ENCLCA] decrypts an encrypted/aes-text-base64 event with the passphrase in the keyring', async function () {
      const keyring = new Keyring({ [KEY_REF]: vec.passphrase });
      const cipher = new EventsCipher(keyring);
      const event = {
        id: 'legacy-1',
        streamIds: ['journal'],
        type: 'encrypted/aes-text-base64',
        content: { payload: vec.payload, keyRef: KEY_REF }
      };
      const dec = await cipher.decryptEvent(event);
      expect(dec.type).to.equal(vec.plaintextObject.type);
      expect(dec.content).to.deep.equal(vec.plaintextObject.content);
      expect(dec.decryptedFrom).to.equal(event);
    });

    it('[ENCLCB] encryptEvent throws — the method is decrypt-only', async function () {
      const keyring = new Keyring({ [KEY_REF]: vec.passphrase });
      const cipher = new EventsCipher(keyring);
      await expect(cipher.encryptEvent(
        { type: 'note/txt', content: 'x' },
        { method: 'aes-text-base64', keyRef: KEY_REF }
      )).to.be.rejected;
    });

    it('[ENCLCC] encryptEventContent throws — the method is decrypt-only', async function () {
      const keyring = new Keyring({ [KEY_REF]: vec.passphrase });
      const cipher = new EventsCipher(keyring);
      await expect(cipher.encryptEventContent(
        { type: 'note/txt', content: 'x' },
        { method: 'aes-text-base64', keyRef: KEY_REF }
      )).to.be.rejected;
    });
  });

  describe('[ENCLM] module shape', function () {
    it('[ENCLMA] exposes decrypt but no encrypt (decrypt-only)', function () {
      expect(aesText.decrypt).to.be.a('function');
      expect(aesText.encrypt).to.equal(undefined);
    });
  });
});
