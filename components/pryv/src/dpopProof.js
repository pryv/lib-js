/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * DPoP (RFC 9449) proof builder — isomorphic (browser + Node ≥ 20), built
 * only on WebCrypto (`globalThis.crypto.subtle`) so it survives the webpack
 * browser bundle unchanged. ES256 only, matching the server
 * (`open-pryv.io/components/oauth2/src/dpop.ts`).
 *
 * A proof is a compact JWS whose header carries the public JWK and whose
 * payload binds the request: `htm` (method), `htu` (URL without query —
 * the server compares in RFC 9449 §4.3 normalized form), `iat`, a fresh
 * single-use `jti`, and — for resource-server requests — `ath`
 * (`base64url(sha256(access_token))`).
 */

const subtle = globalThis.crypto.subtle;
const textEncoder = new TextEncoder();

/**
 * @private
 * base64url-encode raw bytes (no padding). `btoa` is available in browsers
 * and Node ≥ 16.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function base64url (bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * @private
 * @param {string} str
 * @returns {Promise<string>} base64url(sha256(str))
 */
async function sha256base64url (str) {
  const digest = await subtle.digest('SHA-256', textEncoder.encode(str));
  return base64url(new Uint8Array(digest));
}

/**
 * @private
 * htu comparison form: scheme + host + path, query and fragment dropped
 * (RFC 9449 §4.3 — the server normalizes the same way, so a signed URL that
 * still carries a query would match too, but we strip for clarity).
 * @param {string} url
 * @returns {string}
 */
function stripQuery (url) {
  const parsed = new URL(url);
  return parsed.origin + parsed.pathname;
}

/**
 * Build a DPoP proof for one request.
 *
 * @param {Object} params
 * @param {CryptoKeyPair} params.keyPair - ES256 (EC P-256) key pair. The public
 *   key MUST be exportable to JWK; the private key is used to sign.
 * @param {string} params.htm - HTTP method (e.g. `'GET'`, `'POST'`).
 * @param {string} params.htu - full request URL; query/fragment are stripped.
 * @param {string} [params.accessToken] - when present, the proof carries
 *   `ath = base64url(sha256(accessToken))`, binding it to that token
 *   (required on resource-server requests; omitted on the token endpoint).
 * @returns {Promise<string>} the compact JWS proof for the `DPoP` header
 */
async function createDPoPProof ({ keyPair, htm, htu, accessToken }) {
  const jwk = await subtle.exportKey('jwk', keyPair.publicKey);
  const header = {
    typ: 'dpop+jwt',
    alg: 'ES256',
    jwk: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }
  };
  const payload = {
    jti: globalThis.crypto.randomUUID(),
    htm,
    htu: stripQuery(htu),
    iat: Math.floor(Date.now() / 1000)
  };
  if (accessToken != null) payload.ath = await sha256base64url(accessToken);

  const signingInput = base64url(textEncoder.encode(JSON.stringify(header))) +
    '.' + base64url(textEncoder.encode(JSON.stringify(payload)));
  // ECDSA WebCrypto signatures are the raw 64-byte r||s concatenation — exactly
  // the JWS ES256 form (the server rejects DER).
  const signature = await subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, keyPair.privateKey, textEncoder.encode(signingInput)
  );
  return signingInput + '.' + base64url(new Uint8Array(signature));
}

module.exports = { createDPoPProof };
