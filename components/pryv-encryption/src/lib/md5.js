/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Minimal, dependency-free MD5 over bytes.
 *
 * ⚠ This exists SOLELY to reproduce the OpenSSL EVP_BytesToKey key derivation
 * used by the legacy `aes-text-base64` decrypt-only method (MD5 is not part of
 * WebCrypto). MD5 is cryptographically broken — it MUST NOT be used for
 * anything other than reading pre-existing legacy ciphertext. Do not reach for
 * it for hashing, integrity, or any new derivation.
 *
 * Implements RFC 1321. Operates on and returns `Uint8Array`; no `Buffer`, so it
 * runs unchanged in the browser and in Node.js.
 */

function toUint32 (n) { return n >>> 0; }
function rotl (x, c) { return toUint32((x << c) | (x >>> (32 - c))); }

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];

// K[i] = floor(2^32 * abs(sin(i + 1))), precomputed at load.
const K = new Uint32Array(64);
for (let i = 0; i < 64; i++) {
  K[i] = toUint32(Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000));
}

/**
 * Compute the MD5 digest of the given bytes.
 * @param {Uint8Array} message
 * @returns {Uint8Array} 16-byte digest.
 */
function md5 (message) {
  const originalLenBits = message.length * 8;

  // Pad: append 0x80, then zeros, until length ≡ 56 (mod 64), then 64-bit length.
  const paddedLen = ((message.length + 8) >> 6 << 6) + 64;
  const bytes = new Uint8Array(paddedLen);
  bytes.set(message);
  bytes[message.length] = 0x80;

  // 64-bit little-endian bit length (low 32 bits, then high 32 bits).
  const lenLow = toUint32(originalLenBits);
  const lenHigh = Math.floor(originalLenBits / 0x100000000) >>> 0;
  bytes[paddedLen - 8] = lenLow & 0xff;
  bytes[paddedLen - 7] = (lenLow >>> 8) & 0xff;
  bytes[paddedLen - 6] = (lenLow >>> 16) & 0xff;
  bytes[paddedLen - 5] = (lenLow >>> 24) & 0xff;
  bytes[paddedLen - 4] = lenHigh & 0xff;
  bytes[paddedLen - 3] = (lenHigh >>> 8) & 0xff;
  bytes[paddedLen - 2] = (lenHigh >>> 16) & 0xff;
  bytes[paddedLen - 1] = (lenHigh >>> 24) & 0xff;

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const M = new Uint32Array(16);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let j = 0; j < 16; j++) {
      const k = offset + j * 4;
      M[j] = toUint32(bytes[k] | (bytes[k + 1] << 8) | (bytes[k + 2] << 16) | (bytes[k + 3] << 24));
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F;
      let g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | (~D >>> 0));
        g = (7 * i) % 16;
      }
      F = toUint32(F + A + K[i] + M[g]);
      A = D;
      D = C;
      C = B;
      B = toUint32(B + rotl(F, S[i]));
    }

    a0 = toUint32(a0 + A);
    b0 = toUint32(b0 + B);
    c0 = toUint32(c0 + C);
    d0 = toUint32(d0 + D);
  }

  const out = new Uint8Array(16);
  const words = [a0, b0, c0, d0];
  for (let i = 0; i < 4; i++) {
    out[i * 4] = words[i] & 0xff;
    out[i * 4 + 1] = (words[i] >>> 8) & 0xff;
    out[i * 4 + 2] = (words[i] >>> 16) & 0xff;
    out[i * 4 + 3] = (words[i] >>> 24) & 0xff;
  }
  return out;
}

module.exports = { md5 };
