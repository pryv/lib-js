/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect */

const { createId: cuid } = require('@paralleldrive/cuid2');
const { EventsCipher, Keyring } = require('../src');
const vector = require('./fixtures/aes-256-gcm.json');

// Mirror the sibling components: `testData`/`pryv` are provided as globals by the
// Node mocha loader and by the browser bundle; fall back to a require in Node.
const testData = global.testData || require('../../../test/test-data');
const pryv = global.pryv || require('pryv');

const METHOD = 'aes-256-gcm';
const KEY_REF = 'integration-key';
const STREAM_ID = 'data';

describe('[ENCI] EventsCipher integration (live service)', function () {
  this.timeout(30000);

  let conn;
  let cipher;
  const createdIds = [];

  before(async function () {
    this.timeout(30000);
    await testData.prepare();
    conn = new pryv.Connection(testData.apiEndpointWithToken);
    const keyring = new Keyring({ [KEY_REF]: vector.keyBase64 });
    cipher = new EventsCipher(keyring);
  });

  after(async function () {
    // Best-effort cleanup: trash + delete each created event (delete twice).
    for (const id of createdIds) {
      try {
        await conn.api([
          { method: 'events.delete', params: { id } },
          { method: 'events.delete', params: { id } }
        ]);
      } catch (e) {
        // ignore cleanup failures — the run is over
      }
    }
  });

  it('[ENCIA] creates, reads (batch + streamed), updates and re-reads an encrypted event', async function () {
    // Unique per-run marker so parallel / repeated runs never collide.
    const marker = cuid();
    const originalContent = 'secret ' + marker;
    const updatedContent = 'updated ' + marker;

    // --- (b) create an encrypted event -------------------------------------
    const plain = { streamIds: [STREAM_ID], type: 'note/txt', content: originalContent };
    const encrypted = await cipher.encryptEvent(plain, { method: METHOD, keyRef: KEY_REF });
    expect(encrypted.type).to.equal('encrypted/' + METHOD);

    const createRes = await conn.api([{ method: 'events.create', params: encrypted }]);
    // Surface the exact server behaviour for the encrypted/* type.
    expect(
      createRes[0].event,
      'events.create rejected the encrypted/* event: ' + JSON.stringify(createRes[0].error)
    ).to.exist;
    const created = createRes[0].event;
    createdIds.push(created.id);

    // The server stores the encrypted envelope verbatim: type + ciphertext content.
    expect(created.type).to.equal('encrypted/' + METHOD);
    expect(created.content).to.have.property('payload').that.is.a('string');
    expect(created.content).to.have.property('keyRef', KEY_REF);

    // --- (c1) retrieve via events.get + decryptEvents -----------------------
    const getRes = await conn.api([{ method: 'events.get', params: { streams: [STREAM_ID], limit: 20 } }]);
    expect(getRes[0].events, 'events.get failed: ' + JSON.stringify(getRes[0].error)).to.be.an('array');
    const fetched = getRes[0].events.find((e) => e.id === created.id);
    expect(fetched, 'created event not returned by events.get').to.exist;
    expect(fetched.type).to.equal('encrypted/' + METHOD);

    const decrypted = await cipher.decryptEvents([fetched]);
    expect(decrypted[0].type).to.equal('note/txt');
    expect(decrypted[0].content).to.equal(originalContent);
    expect(decrypted[0].decryptedFrom).to.equal(fetched);

    // --- (c2) retrieve via getEventsStreamed + wrapForEachEvent -------------
    const streamed = [];
    await conn.getEventsStreamed(
      { streams: [STREAM_ID], limit: 100 },
      cipher.wrapForEachEvent((event) => { streamed.push(event); })
    );
    const streamedOne = streamed.find((e) => e.decryptedFrom != null && e.decryptedFrom.id === created.id);
    expect(streamedOne, 'created event not seen in getEventsStreamed').to.exist;
    expect(streamedOne.type).to.equal('note/txt');
    expect(streamedOne.content).to.equal(originalContent);

    // --- (d) update with NEW plaintext, re-fetch and decrypt ---------------
    const reEncrypted = await cipher.encryptEventContent(
      { type: 'note/txt', content: updatedContent },
      { method: METHOD, keyRef: KEY_REF }
    );
    expect(reEncrypted.type).to.equal('encrypted/' + METHOD);

    const updateRes = await conn.api([{ method: 'events.update', params: { id: created.id, update: reEncrypted } }]);
    expect(
      updateRes[0].event,
      'events.update rejected the re-encrypted content: ' + JSON.stringify(updateRes[0].error)
    ).to.exist;

    const reGet = await conn.api([{ method: 'events.get', params: { streams: [STREAM_ID], limit: 20 } }]);
    const reFetched = reGet[0].events.find((e) => e.id === created.id);
    expect(reFetched, 'updated event not returned by events.get').to.exist;
    expect(reFetched.type).to.equal('encrypted/' + METHOD);

    const reDecrypted = await cipher.decryptEvent(reFetched);
    expect(reDecrypted.type).to.equal('note/txt');
    expect(reDecrypted.content).to.equal(updatedContent);
  });

  it('[ENCIB] round-trips an ENCRYPTED attachment through the live service', async function () {
    const marker = cuid();

    // Random binary payload — encrypted client-side into the method's raw byte
    // layout (no Base64), then uploaded as the file body.
    const original = new Uint8Array(3000);
    for (let i = 0; i < original.length; i += 65536) {
      globalThis.crypto.getRandomValues(original.subarray(i, Math.min(i + 65536, original.length)));
    }
    const encryptedBytes = await cipher.encryptAttachmentData(original, { method: METHOD, keyRef: KEY_REF });

    // The event itself is encrypted with the same method/key.
    const plain = { streamIds: [STREAM_ID], type: 'note/txt', content: 'attach ' + marker };
    const encrypted = await cipher.encryptEvent(plain, { method: METHOD, keyRef: KEY_REF });

    // Isomorphic upload: a Blob of the encrypted bytes via createEventWithFileFromBuffer
    // (accepts a Blob in both Node >= 20 and the browser).
    const blob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
    const createBody = await conn.createEventWithFileFromBuffer(encrypted, blob, marker + '.bin');
    expect(createBody.event, 'create-with-file failed: ' + JSON.stringify(createBody.error)).to.exist;
    const created = createBody.event;
    createdIds.push(created.id);

    // The server stores the encrypted envelope + the (already-encrypted) file verbatim.
    expect(created.type).to.equal('encrypted/' + METHOD);
    expect(created.attachments, 'no attachments on created event').to.be.an('array').with.length(1);
    const att = created.attachments[0];
    expect(att.id).to.be.a('string');
    expect(att.readToken).to.be.a('string');
    // The core sees only ciphertext, so the stored size is the encrypted length
    // (aes-256-gcm: iv[12] + plaintext + tag[16]).
    expect(att.size).to.equal(original.length + 12 + 16);

    // Download the raw bytes: GET {endpoint}events/{eventId}/{fileId}?readToken=...
    const url = conn.endpoint + 'events/' + created.id + '/' + att.id + '?readToken=' + att.readToken;
    const dlRes = await fetch(url);
    expect(dlRes.status, 'attachment download HTTP status').to.equal(200);
    const downloaded = new Uint8Array(await dlRes.arrayBuffer());

    // Bytes served back must equal the ciphertext we uploaded...
    expect(Array.from(downloaded)).to.deep.equal(Array.from(encryptedBytes));

    // ...and decrypting them (via the created event) yields the original bytes exactly.
    const decrypted = await cipher.decryptAttachmentData(created, downloaded);
    expect(Array.from(decrypted)).to.deep.equal(Array.from(original));
  });
});
