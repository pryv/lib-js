/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const Connection = require('./Connection');
const { createDPoPProof } = require('./dpopProof');

/**
 * @class SignedConnection
 * A {@link Connection} whose access token is sender-constrained via DPoP
 * (RFC 9449): every request carries a fresh proof signed with a client-held
 * key, and presents the token under the `DPoP` auth-scheme. A token stolen
 * from this connection is useless to anyone who does not also hold the
 * private key.
 *
 * Built by {@link OAuth2Client} with `dpop: true` (which binds the token to
 * the key at issuance and hands the same key pair here). It can also be
 * constructed directly from an `apiEndpoint` whose token was already bound
 * to `keyPair` — mismatched keys make every request fail the server's
 * proof-of-possession check.
 *
 * The key pair is ES256 (EC P-256), the only algorithm the server accepts;
 * its public key must be exportable to JWK. Attachment downloads via a
 * `readToken` need no proof (the server exempts that capability), so those
 * keep working through a plain URL.
 *
 * @memberof pryv
 */
class SignedConnection extends Connection {
  /**
   * @param {string} apiEndpoint - Pryv API endpoint carrying the DPoP-bound token
   * @param {CryptoKeyPair} keyPair - the ES256 key the token is bound to
   * @param {Service} [service] - optional pre-built Service
   */
  constructor (apiEndpoint, keyPair, service) {
    super(apiEndpoint, service);
    if (keyPair == null || keyPair.privateKey == null || keyPair.publicKey == null) {
      throw new Error('SignedConnection: an ES256 CryptoKeyPair ({ publicKey, privateKey }) is required');
    }
    this._dpopKeyPair = keyPair;
  }

  /**
   * @protected
   * @override
   * Attach a per-request DPoP proof and present the token under the DPoP
   * scheme. `url` is the request URL without query — the proof's `htu`.
   * @param {string} method
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async _authHeaders (method, url) {
    const proof = await createDPoPProof({
      keyPair: this._dpopKeyPair,
      htm: method,
      htu: url,
      accessToken: this.token
    });
    return {
      Authorization: 'DPoP ' + this.token,
      DPoP: proof
    };
  }
}

module.exports = SignedConnection;
