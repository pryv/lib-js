/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

/**
 * Shared secrets helper — unit tests.
 *
 * Driven with a stub connection that records what would be sent, so the crypto
 * and the request shape are checked without a server (same approach as the CMC
 * helper tests).
 */

/* global describe, it */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const SharedSecrets = require('../src/SharedSecrets');

function stubConnection (reply) {
  const calls = [];
  return {
    calls,
    async post (path, body) {
      calls.push({ path, body });
      return reply(path, body);
    }
  };
}

describe('[SSEC] shared-secrets helper', function () {
  it('[SS01] parses a key and rejects malformed ones without throwing', function () {
    assert.deepEqual(SharedSecrets.parseKey('abc.def'), { id: 'abc', randomPart: 'def' });
    for (const bad of ['', '.', 'nodot', 'a.', '.b', 'a.b.c', null, undefined, 42, {}]) {
      assert.equal(SharedSecrets.parseKey(bad), null, 'must reject ' + JSON.stringify(bad));
    }
  });

  it('[SS02] hashes and HMACs identically to the server side', async function () {
    const hex = await SharedSecrets.sha256Hex('hello');
    assert.equal(hex, crypto.createHash('sha256').update('hello').digest('hex'));

    const mac = await SharedSecrets.hmacSha256Hex('V', 'message');
    assert.equal(mac, crypto.createHmac('sha256', 'V').update('message').digest('hex'));
  });

  it('[SS03] plain create passes the params through and returns the server key', async function () {
    const conn = stubConnection(() => ({
      sharedSecret: { id: 'evt1', key: 'evt1.RANDOM', status: 'pending' }
    }));
    const out = await SharedSecrets.create(conn, {
      ttl: 300, title: 't', onConsumed: { message: 'm' }, secret: { a: 1 }
    });
    assert.equal(conn.calls[0].path, 'shared-secrets');
    assert.equal(conn.calls[0].body.ttl, 300);
    assert.equal(conn.calls[0].body.keyHash, undefined, 'server mints the key in this mode');
    assert.equal(out.key, 'evt1.RANDOM');
  });

  it('[SS04] hmac create sends only a hash and a proof, never the verifier secret', async function () {
    const conn = stubConnection(() => ({ sharedSecret: { id: 'evt2', status: 'pending' } }));
    const out = await SharedSecrets.create(conn, {
      ttl: 300,
      title: 't',
      onConsumed: { message: 'm' },
      secret: { a: 1 },
      signature: { type: 'hmac-sha256', verifierSecret: 'V' }
    });

    const sent = conn.calls[0].body;
    assert.match(sent.keyHash, /^[0-9a-f]{64}$/);
    assert.equal(sent.signature.type, 'hmac-sha256');
    const serialized = JSON.stringify(sent);
    assert.ok(!serialized.includes('"V"'), 'the verifier secret must never be sent');

    // The key is composed client-side, and its random half is what was hashed.
    const parsed = SharedSecrets.parseKey(out.key);
    assert.equal(parsed.id, 'evt2');
    assert.equal(await SharedSecrets.sha256Hex(parsed.randomPart), sent.keyHash);
    // …and the proof is the HMAC over that same random half.
    assert.equal(sent.signature.value,
      crypto.createHmac('sha256', 'V').update(parsed.randomPart).digest('hex'));
  });

  it('[SS05] the random half carries real entropy and never repeats', async function () {
    const conn = stubConnection(() => ({ sharedSecret: { id: 'e', status: 'pending' } }));
    const seen = new Set();
    for (let i = 0; i < 50; i++) {
      const out = await SharedSecrets.create(conn, {
        ttl: 60, title: 't', onConsumed: { message: 'm' }, secret: 1,
        signature: { type: 'hmac-sha256', verifierSecret: 'V' }
      });
      const { randomPart } = SharedSecrets.parseKey(out.key);
      assert.ok(randomPart.length >= 32, 'too short: ' + randomPart);
      assert.match(randomPart, /^[A-Za-z0-9_-]+$/);
      seen.add(randomPart);
    }
    assert.equal(seen.size, 50);
  });

  it('[SS06] status posts the key in the body, never in the path', async function () {
    const conn = stubConnection(() => ({ sharedSecret: { id: 'e', status: 'consumed' } }));
    await SharedSecrets.status(conn, 'e.RANDOM');
    assert.equal(conn.calls[0].path, 'shared-secrets/status',
      'the key must not appear in the path — it would land in access logs');
    assert.equal(conn.calls[0].body.key, 'e.RANDOM');
  });
});
