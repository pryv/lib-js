/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Asymmetric `ecies-aes-256-gcm` method (ECIES over NIST P-256 + AES-256-GCM).
 *
 * A sender encrypts to a recipient's PUBLIC key; only the holder of the matching
 * PRIVATE key can decrypt. This enables sharing an encrypted event with someone
 * without ever moving a shared secret.
 *
 * Wire format of `content.payload` (FROZEN — published in the event-type
 * registry):
 *
 *   base64( ephemeralPublicKey[65, SEC1 uncompressed 0x04||X||Y]
 *           || iv[12] || ciphertext || gcm-tag[16] )
 *
 * Scheme:
 *   1. Generate an ephemeral P-256 key pair.
 *   2. ECDH(ephemeral private, recipient public) -> 32-byte shared secret.
 *   3. HKDF-SHA-256(secret, salt = <empty>, info = ASCII "encrypted/ecies-aes-256-gcm"),
 *      32 bytes -> AES-256-GCM key.
 *   4. AES-256-GCM(UTF-8 JSON of the material, key, random 12-byte IV).
 *      WebCrypto appends the 16-byte tag to the ciphertext it returns.
 *
 * Key material (see the component README):
 *   - decrypt: recipient PRIVATE key as a CryptoKey (ECDH), a JWK (has `d`), or
 *     base64 / Uint8Array PKCS#8.
 *   - encrypt: recipient PUBLIC key as a CryptoKey, a JWK (no `d`), a raw
 *     65-byte Uint8Array (SEC1 uncompressed) or its base64.
 *   - either operation also accepts a `{ publicKey, privateKey }` pair object
 *     holding any of the above; the side the operation needs is picked.
 */
const { bytesToBase64, base64ToBytes } = require('../lib/base64');

const CURVE = 'P-256';
const ALGORITHM = { name: 'ECDH', namedCurve: CURVE };
const INFO = 'encrypted/ecies-aes-256-gcm';
const EPH_PUB_LENGTH = 65; // SEC1 uncompressed: 0x04 || X(32) || Y(32)
const IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

/**
 * Mint a fresh recipient key pair as exportable JWK objects.
 * @returns {Promise<{ publicKey: Object, privateKey: Object }>}
 */
async function generateKeyPair () {
  const subtle = globalThis.crypto.subtle;
  const pair = await subtle.generateKey(ALGORITHM, true, ['deriveBits']);
  return {
    publicKey: await subtle.exportKey('jwk', pair.publicKey),
    privateKey: await subtle.exportKey('jwk', pair.privateKey)
  };
}

/**
 * Normalise any accepted key-material shape into an ECDH CryptoKey.
 * @param {*} material - CryptoKey, JWK, raw/PKCS#8 Uint8Array, base64 string, or a `{ publicKey, privateKey }` pair.
 * @param {'encrypt'|'decrypt'} usage - `encrypt` needs the PUBLIC key, `decrypt` the PRIVATE key.
 * @returns {Promise<CryptoKey>}
 */
async function normalizeKey (material, usage) {
  if (usage !== 'encrypt' && usage !== 'decrypt') {
    throw new Error(`ecies-aes-256-gcm: unknown usage "${usage}"`);
  }
  if (material == null) {
    throw new Error('ecies-aes-256-gcm: key material is required');
  }
  const wantPrivate = usage === 'decrypt';
  const subtle = globalThis.crypto.subtle;

  // Pair object: pick the side the operation needs.
  if (isPair(material)) {
    const side = wantPrivate ? material.privateKey : material.publicKey;
    if (side == null) {
      throw new Error(`ecies-aes-256-gcm: pair object has no ${wantPrivate ? 'privateKey' : 'publicKey'}`);
    }
    return normalizeKey(side, usage);
  }

  // Already a CryptoKey — trust it.
  if (typeof CryptoKey !== 'undefined' && material instanceof CryptoKey) {
    return material;
  }

  // JWK object.
  if (typeof material === 'object' && !(material instanceof Uint8Array) &&
      !(material instanceof ArrayBuffer) && material.kty != null) {
    const isPrivateJwk = material.d != null;
    if (wantPrivate && !isPrivateJwk) {
      throw new Error('ecies-aes-256-gcm: decrypt requires a private key (JWK with "d")');
    }
    return subtle.importKey('jwk', material, ALGORITHM, false, wantPrivate ? ['deriveBits'] : []);
  }

  // Raw bytes: PKCS#8 for private, SEC1 raw (65 bytes) for public.
  let bytes;
  if (material instanceof Uint8Array) {
    bytes = material;
  } else if (material instanceof ArrayBuffer) {
    bytes = new Uint8Array(material);
  } else if (typeof material === 'string') {
    bytes = base64ToBytes(material);
  } else {
    throw new Error('ecies-aes-256-gcm: unsupported key material');
  }

  if (wantPrivate) {
    return subtle.importKey('pkcs8', bytes, ALGORITHM, false, ['deriveBits']);
  }
  if (bytes.length !== EPH_PUB_LENGTH || bytes[0] !== 0x04) {
    throw new Error('ecies-aes-256-gcm: public key must be a 65-byte SEC1 uncompressed point (0x04 || X || Y)');
  }
  return subtle.importKey('raw', bytes, ALGORITHM, false, []);
}

/**
 * Derive the AES-256-GCM key from an ECDH shared secret via HKDF-SHA-256.
 * @param {Uint8Array} secret - the 32-byte ECDH shared secret.
 * @param {string[]} usages
 * @returns {Promise<CryptoKey>}
 */
async function deriveAesKey (secret, usages) {
  const subtle = globalThis.crypto.subtle;
  const hkdfKey = await subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  const aesBits = await subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(INFO) },
    hkdfKey,
    256
  );
  return subtle.importKey('raw', new Uint8Array(aesBits), 'AES-GCM', false, usages);
}

/**
 * Encrypt a material object to the recipient's public key.
 * @param {Object} material - the object to serialise + encrypt.
 * @param {*} key - recipient public key in any accepted shape (or a pair object).
 * @returns {Promise<{ payload: string }>}
 */
async function encrypt (material, key) {
  const subtle = globalThis.crypto.subtle;
  const recipientPublic = await normalizeKey(key, 'encrypt');

  const ephemeral = await subtle.generateKey(ALGORITHM, true, ['deriveBits']);
  const secretBits = await subtle.deriveBits({ name: 'ECDH', public: recipientPublic }, ephemeral.privateKey, 256);
  const aesKey = await deriveAesKey(new Uint8Array(secretBits), ['encrypt']);

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = new TextEncoder().encode(JSON.stringify(material));
  const cipherBuffer = await subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext);
  const cipherBytes = new Uint8Array(cipherBuffer);

  const ephRaw = new Uint8Array(await subtle.exportKey('raw', ephemeral.publicKey));

  const out = new Uint8Array(ephRaw.length + iv.length + cipherBytes.length);
  out.set(ephRaw, 0);
  out.set(iv, ephRaw.length);
  out.set(cipherBytes, ephRaw.length + iv.length);
  return { payload: bytesToBase64(out) };
}

/**
 * Decrypt an event `content` with the recipient's private key.
 * Throws on any failure (missing/short payload, bad key, tampered tag, non-JSON).
 * @param {{ payload: string }} content
 * @param {*} key - recipient private key in any accepted shape (or a pair object).
 * @returns {Promise<Object>}
 */
async function decrypt (content, key) {
  if (content == null || typeof content.payload !== 'string') {
    throw new Error('ecies-aes-256-gcm: content.payload must be a base64 string');
  }
  const subtle = globalThis.crypto.subtle;
  const all = base64ToBytes(content.payload);
  if (all.length < EPH_PUB_LENGTH + IV_LENGTH + GCM_TAG_LENGTH) {
    throw new Error('ecies-aes-256-gcm: payload too short');
  }

  const ephRaw = all.slice(0, EPH_PUB_LENGTH);
  const iv = all.slice(EPH_PUB_LENGTH, EPH_PUB_LENGTH + IV_LENGTH);
  const cipherBytes = all.slice(EPH_PUB_LENGTH + IV_LENGTH);

  const recipientPrivate = await normalizeKey(key, 'decrypt');
  const ephemeralPublic = await subtle.importKey('raw', ephRaw, ALGORITHM, false, []);
  const secretBits = await subtle.deriveBits({ name: 'ECDH', public: ephemeralPublic }, recipientPrivate, 256);
  const aesKey = await deriveAesKey(new Uint8Array(secretBits), ['decrypt']);

  const plainBuffer = await subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipherBytes);
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

/**
 * @param {*} m
 * @returns {boolean} true when `m` is a `{ publicKey, privateKey }` pair object (not a JWK).
 */
function isPair (m) {
  return m != null && typeof m === 'object' && m.kty == null &&
    !(m instanceof Uint8Array) && !(m instanceof ArrayBuffer) &&
    (typeof CryptoKey === 'undefined' || !(m instanceof CryptoKey)) &&
    (m.publicKey != null || m.privateKey != null);
}

module.exports = { encrypt, decrypt, generateKeyPair, normalizeKey };
