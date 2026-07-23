/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Isomorphic base64 helpers built on the standard `btoa`/`atob` globals,
 * which are available in browsers and in Node.js (>= 16). No `Buffer`, so the
 * same code path runs unchanged in both environments.
 */

/**
 * Encode raw bytes to a standard (non-URL-safe) base64 string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToBase64 (bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a standard base64 string to raw bytes.
 * @param {string} b64
 * @returns {Uint8Array}
 */
function base64ToBytes (b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

module.exports = { bytesToBase64, base64ToBytes };
