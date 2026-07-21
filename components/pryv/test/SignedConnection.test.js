/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect */

const SignedConnection = require('../src/SignedConnection');
const { createDPoPProof } = require('../src/dpopProof');

const subtle = globalThis.crypto.subtle;
const decoder = new TextDecoder();

function b64urlToBytes (s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function decodeSegment (seg) { return JSON.parse(decoder.decode(b64urlToBytes(seg))); }
async function sha256b64url (str) {
  const d = await subtle.digest('SHA-256', new TextEncoder().encode(str));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

describe('[OAUTH-SC] SignedConnection + DPoP proof', function () {
  let keyPair;
  before(async function () {
    keyPair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  });

  describe('[SC-PROOF] createDPoPProof', function () {
    it('[SC-P1] builds a compact JWS whose signature verifies against the embedded key', async function () {
      const proof = await createDPoPProof({ keyPair, htm: 'GET', htu: 'https://host/path/events', accessToken: 'TOK' });
      const [h, p, sig] = proof.split('.');
      expect(proof.split('.')).to.have.length(3);

      const header = decodeSegment(h);
      expect(header.typ).to.equal('dpop+jwt');
      expect(header.alg).to.equal('ES256');
      expect(header.jwk).to.include.keys(['kty', 'crv', 'x', 'y']);
      expect(header.jwk).to.not.have.property('d'); // never the private half

      // The signature verifies against the public key embedded in the header.
      const pub = await subtle.importKey('jwk', header.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const ok = await subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' }, pub, b64urlToBytes(sig), new TextEncoder().encode(h + '.' + p)
      );
      expect(ok).to.equal(true);
    });

    it('[SC-P2] binds htm, htu (query stripped), iat, a unique jti, and ath', async function () {
      const proof = await createDPoPProof({ keyPair, htm: 'POST', htu: 'https://host/path/events?a=1#frag', accessToken: 'THE-TOKEN' });
      const payload = decodeSegment(proof.split('.')[1]);
      expect(payload.htm).to.equal('POST');
      expect(payload.htu).to.equal('https://host/path/events'); // no query / fragment
      expect(payload.iat).to.be.a('number');
      expect(payload.jti).to.be.a('string').with.length.greaterThan(8);
      expect(payload.ath).to.equal(await sha256b64url('THE-TOKEN'));

      const again = await createDPoPProof({ keyPair, htm: 'POST', htu: 'https://host/path/events', accessToken: 'THE-TOKEN' });
      expect(decodeSegment(again.split('.')[1]).jti).to.not.equal(payload.jti); // fresh each call
    });

    it('[SC-P3] omits ath when no access token is given (token-endpoint shape)', async function () {
      const proof = await createDPoPProof({ keyPair, htm: 'POST', htu: 'https://host/oauth2/token' });
      expect(decodeSegment(proof.split('.')[1])).to.not.have.property('ath');
    });
  });

  describe('[SC-CONN] SignedConnection', function () {
    it('[SC-C1] rejects construction without a key pair', function () {
      expect(() => new SignedConnection('https://TOK@host/path/')).to.throw(/CryptoKeyPair/);
      expect(() => new SignedConnection('https://TOK@host/path/', {})).to.throw(/CryptoKeyPair/);
    });

    it('[SC-C2] _authHeaders presents the token under the DPoP scheme + a matching proof', async function () {
      const conn = new SignedConnection('https://TOK@host/path/', keyPair);
      expect(conn.token).to.equal('TOK');
      const headers = await conn._authHeaders('GET', conn.endpoint + 'events');
      expect(headers.Authorization).to.equal('DPoP TOK');
      expect(headers.DPoP).to.be.a('string');
      const payload = decodeSegment(headers.DPoP.split('.')[1]);
      expect(payload.htm).to.equal('GET');
      expect(payload.htu).to.equal('https://host/path/events');
      expect(payload.ath).to.equal(await sha256b64url('TOK')); // bound to THIS connection's token
    });

    it('[SC-C3] is a Connection (inherits the data API)', function () {
      const conn = new SignedConnection('https://TOK@host/path/', keyPair);
      const Connection = require('../src/Connection');
      expect(conn).to.be.instanceOf(Connection);
      expect(typeof conn.get).to.equal('function');
      expect(typeof conn.post).to.equal('function');
    });
  });
});
