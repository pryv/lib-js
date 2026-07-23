/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Legacy, decrypt-only `aes-text-base64` method.
 *
 * Reads the historical ciphertext format produced by
 * `CryptoJS.AES.encrypt(text, passphrase).toString()` — the OpenSSL
 * "salted" envelope:
 *
 *   base64( "Salted__" || salt[8] || AES-256-CBC(text, key, iv) )
 *
 * The 32-byte AES key and 16-byte IV are derived from the passphrase STRING and
 * the salt via OpenSSL's EVP_BytesToKey (MD5, one iteration). The cipher is
 * AES-256-CBC with PKCS#7 padding, which WebCrypto's `AES-CBC` handles natively.
 *
 * Key material for THIS method is the passphrase STRING itself — not base64 of
 * key bytes (unlike `aes-256-gcm`). See the component README.
 *
 * This method is decrypt-only: there is no `encrypt`. It exists to read
 * pre-existing legacy events; new events must use a modern method.
 */
const { base64ToBytes } = require('../lib/base64');
const { md5 } = require('../lib/md5');

const SALTED_MAGIC = [0x53, 0x61, 0x6c, 0x74, 0x65, 0x64, 0x5f, 0x5f]; // "Salted__"
const SALT_LENGTH = 8;
const KEY_LENGTH = 32; // AES-256
const IV_LENGTH = 16; // CBC block size

/**
 * OpenSSL EVP_BytesToKey with MD5 and a single hashing chain (count = 1).
 * @param {Uint8Array} passphrase - UTF-8 bytes of the passphrase string.
 * @param {Uint8Array} salt - 8 salt bytes.
 * @returns {{ key: Uint8Array, iv: Uint8Array }}
 */
function evpBytesToKey (passphrase, salt) {
  const needed = KEY_LENGTH + IV_LENGTH;
  const derived = new Uint8Array(needed);
  let filled = 0;
  let block = new Uint8Array(0);
  while (filled < needed) {
    const input = new Uint8Array(block.length + passphrase.length + salt.length);
    input.set(block, 0);
    input.set(passphrase, block.length);
    input.set(salt, block.length + passphrase.length);
    block = md5(input);
    const take = Math.min(block.length, needed - filled);
    derived.set(block.subarray(0, take), filled);
    filled += take;
  }
  return { key: derived.slice(0, KEY_LENGTH), iv: derived.slice(KEY_LENGTH, KEY_LENGTH + IV_LENGTH) };
}

/**
 * Decrypt a legacy `aes-text-base64` `content` back into its material object.
 * Throws on any failure (missing/short payload, absent "Salted__" prefix, wrong
 * passphrase / bad padding, or non-JSON plaintext).
 * @param {{ payload: string }} content
 * @param {string} key - the passphrase STRING.
 * @returns {Promise<Object>}
 */
async function decrypt (content, key) {
  if (content == null || typeof content.payload !== 'string') {
    throw new Error('aes-text-base64: content.payload must be a base64 string');
  }
  if (typeof key !== 'string') {
    throw new Error('aes-text-base64: key material must be the passphrase string');
  }

  const blob = base64ToBytes(content.payload);
  if (blob.length < SALTED_MAGIC.length + SALT_LENGTH + IV_LENGTH) {
    throw new Error('aes-text-base64: payload too short');
  }
  for (let i = 0; i < SALTED_MAGIC.length; i++) {
    if (blob[i] !== SALTED_MAGIC[i]) {
      throw new Error('aes-text-base64: missing "Salted__" prefix');
    }
  }

  const salt = blob.slice(SALTED_MAGIC.length, SALTED_MAGIC.length + SALT_LENGTH);
  const ciphertext = blob.slice(SALTED_MAGIC.length + SALT_LENGTH);

  const passphrase = new TextEncoder().encode(key);
  const { key: keyBytes, iv } = evpBytesToKey(passphrase, salt);

  const cryptoKey = await globalThis.crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['decrypt']);
  const plainBuffer = await globalThis.crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, ciphertext);
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

module.exports = { decrypt };
