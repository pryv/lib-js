/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Built-in `aes-256-gcm` encryption method.
 *
 * Wire format of `content.payload`:
 *   base64( iv (12 bytes) || ciphertext || gcm-auth-tag (16 bytes) )
 *
 * WebCrypto's `subtle.encrypt` appends the 16-byte GCM authentication tag to
 * the ciphertext it returns, so the payload is simply the random IV followed
 * by that output, base64-encoded.
 *
 * Key material is accepted as a 32-byte `Uint8Array`, a base64 string of 32
 * bytes, or an already-imported AES-GCM `CryptoKey`.
 */
const { bytesToBase64, base64ToBytes } = require('../lib/base64');

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // bytes — the recommended GCM nonce length
const KEY_LENGTH = 32; // bytes — AES-256

/**
 * Normalise supported key-material shapes into an AES-GCM CryptoKey.
 * @param {Uint8Array|string|CryptoKey} key
 * @returns {Promise<CryptoKey>}
 */
async function importKey (key) {
  if (typeof CryptoKey !== 'undefined' && key instanceof CryptoKey) return key;

  let raw;
  if (key instanceof Uint8Array) {
    raw = key;
  } else if (key instanceof ArrayBuffer) {
    raw = new Uint8Array(key);
  } else if (typeof key === 'string') {
    raw = base64ToBytes(key);
  } else {
    throw new Error('aes-256-gcm: unsupported key material (expected Uint8Array, base64 string or CryptoKey)');
  }

  if (raw.length !== KEY_LENGTH) {
    throw new Error(`aes-256-gcm: key must be ${KEY_LENGTH} bytes, got ${raw.length}`);
  }
  return globalThis.crypto.subtle.importKey('raw', raw, ALGORITHM, false, ['encrypt', 'decrypt']);
}

/**
 * Encrypt a material object into an event `content`.
 * @param {Object} material - the object to serialise + encrypt.
 * @param {Uint8Array|string|CryptoKey} key
 * @returns {Promise<{ payload: string }>}
 */
async function encrypt (material, key) {
  const cryptoKey = await importKey(key);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = new TextEncoder().encode(JSON.stringify(material));
  const cipherBuffer = await globalThis.crypto.subtle.encrypt({ name: ALGORITHM, iv }, cryptoKey, plaintext);
  const cipherBytes = new Uint8Array(cipherBuffer);

  const out = new Uint8Array(iv.length + cipherBytes.length);
  out.set(iv, 0);
  out.set(cipherBytes, iv.length);
  return { payload: bytesToBase64(out) };
}

/**
 * Decrypt an event `content` back into its material object.
 * Throws on any failure (bad key, tampered tag, malformed / truncated payload,
 * or non-JSON plaintext).
 * @param {{ payload: string }} content
 * @param {Uint8Array|string|CryptoKey} key
 * @returns {Promise<Object>}
 */
async function decrypt (content, key) {
  if (content == null || typeof content.payload !== 'string') {
    throw new Error('aes-256-gcm: content.payload must be a base64 string');
  }
  const cryptoKey = await importKey(key);
  const all = base64ToBytes(content.payload);
  if (all.length <= IV_LENGTH) {
    throw new Error('aes-256-gcm: payload too short');
  }
  const iv = all.slice(0, IV_LENGTH);
  const cipherBytes = all.slice(IV_LENGTH);
  const plainBuffer = await globalThis.crypto.subtle.decrypt({ name: ALGORITHM, iv }, cryptoKey, cipherBytes);
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

module.exports = { encrypt, decrypt };
