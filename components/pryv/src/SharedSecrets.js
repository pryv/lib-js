/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

/**
 * Shared secrets — hand a secret to a third party by one-time key.
 *
 * The problem this solves: passing a secret (typically an apiEndpoint carrying
 * an access token) to a third party usually means putting it in a URL, where it
 * survives in browser history, referrer headers and server access logs. Instead,
 * store the secret on the account and hand over a random key that can be
 * redeemed exactly once.
 *
 * Redemption needs no credentials — the key IS the credential — so the third
 * party can use `retrieve` with nothing but the URL you gave them.
 *
 * All crypto goes through the Web Crypto API rather than Node's `crypto`, so the
 * same code runs in the browser bundle and in Node.
 */

/** Reads `key` back into the pieces the API expects. */
function parseKey (key) {
  if (typeof key !== 'string') return null;
  const parts = key.split('.');
  if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) return null;
  return { id: parts[0], randomPart: parts[1] };
}

function base64url (bytes) {
  let binary = '';
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  const b64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64');
  return b64.replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function toHex (buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

function subtle () {
  const c = globalThis.crypto;
  if (c == null || c.subtle == null) {
    throw new Error('Web Crypto is unavailable — Node 20+ or a secure browser context is required.');
  }
  return c.subtle;
}

/** 24 random bytes (192 bits), base64url — the strength of the key itself. */
function randomPart () {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  return base64url(bytes);
}

/** SHA-256 of a string, hex — what the server stores in place of the key. */
async function sha256Hex (value) {
  const data = new TextEncoder().encode(value);
  return toHex(await subtle().digest('SHA-256', data));
}

/**
 * HMAC-SHA256 of `message` under `verifierSecret`, hex.
 *
 * Used for the `hmac-sha256` signature: creator and redeemer share the verifier
 * secret out of band, and only the HMAC ever reaches the server — so the server
 * can check the proof without being able to produce one.
 */
async function hmacSha256Hex (verifierSecret, message) {
  const enc = new TextEncoder();
  const cryptoKey = await subtle().importKey(
    'raw', enc.encode(verifierSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await subtle().sign('HMAC', cryptoKey, enc.encode(message)));
}

/**
 * Create a shared secret on the account `connection` is authenticated against.
 *
 * @param {Connection} connection
 * @param {Object} params
 * @param {number} params.ttl seconds the secret stays redeemable (required)
 * @param {string} params.title shown to the account owner (required)
 * @param {Object} params.onConsumed `{ message, returnUrl? }` shown once spent
 * @param {*} params.secret the payload — any JSON value
 * @param {Object} [params.signature] `{ type: 'secret', value }` or
 *   `{ type: 'hmac-sha256', verifierSecret }`. For the HMAC form the key
 *   material is generated here so the proof can be bound before creation.
 * @returns {Promise<Object>} `{ id, key, expires, ... }` — `key` is returned
 *   only here and cannot be recovered later.
 */
async function create (connection, params) {
  const { signature, ...rest } = params || {};
  const body = { ...rest };
  let key = null;

  if (signature != null && signature.type === 'hmac-sha256') {
    // The HMAC is bound to key material that must exist BEFORE the item does,
    // so the client generates the random half and sends only its hash.
    const random = randomPart();
    body.keyHash = await sha256Hex(random);
    body.signature = {
      type: 'hmac-sha256',
      value: await hmacSha256Hex(signature.verifierSecret, random)
    };
    const res = await connection.post('shared-secrets', body);
    return { ...res.sharedSecret, key: res.sharedSecret.id + '.' + random };
  }

  if (signature != null) body.signature = signature;
  const res = await connection.post('shared-secrets', body);
  key = res.sharedSecret.key;
  return { ...res.sharedSecret, key };
}

/**
 * Redeem a key. Needs no credentials, so a third party can call it directly.
 *
 * @param {string} apiEndpoint the account's API endpoint (no token needed)
 * @param {string} key
 * @param {Object} [options]
 * @param {string} [options.passphrase] for a `secret`-type signature
 * @param {string} [options.verifierSecret] for an `hmac-sha256` signature
 * @returns {Promise<{secret: *}>} on success. On refusal the API error carries
 *   the creator's `message` and optional `returnUrl` to show the end user.
 */
async function retrieve (apiEndpoint, key, options = {}) {
  const body = { key };
  if (options.passphrase != null) {
    body.signature = { type: 'secret', payload: options.passphrase };
  } else if (options.verifierSecret != null) {
    const parsed = parseKey(key);
    if (parsed == null) throw new Error('Malformed shared-secret key.');
    body.signature = {
      type: 'hmac-sha256',
      payload: await hmacSha256Hex(options.verifierSecret, parsed.randomPart)
    };
  }
  const base = apiEndpoint.endsWith('/') ? apiEndpoint : apiEndpoint + '/';
  const res = await fetch(base + 'shared-secrets/retrieve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const parsed = await res.json();
  if (!res.ok) {
    const err = new Error(parsed?.error?.message || 'Shared secret unavailable.');
    err.id = parsed?.error?.id;
    err.returnUrl = parsed?.error?.data?.returnUrl;
    throw err;
  }
  return parsed;
}

/** Status of a shared secret, without consuming it. Creator or personal token. */
async function status (connection, key) {
  const res = await connection.post('shared-secrets/status', { key });
  return res.sharedSecret;
}

module.exports = {
  create,
  retrieve,
  status,
  parseKey,
  hmacSha256Hex,
  sha256Hex
};
