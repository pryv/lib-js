/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect */

const OAuth2Client = require('../src/OAuth2Client');
const oauth = require('oauth4webapi');

const ISSUER = 'https://host';
const DISCOVERY = {
  issuer: ISSUER,
  authorization_endpoint: ISSUER + '/oauth2/authorize',
  token_endpoint: ISSUER + '/oauth2/token',
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  token_endpoint_auth_methods_supported: ['client_secret_basic', 'none'],
  code_challenge_methods_supported: ['S256']
};

// A Pryv token-endpoint response (RFC 6749 §5.1 + the `apiEndpoint` extension).
function tokenBody (overrides = {}) {
  return Object.assign({
    access_token: 'TOKEN123',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'REFRESH456',
    scope: 'cmc:study-A',
    apiEndpoint: 'https://TOKEN123@host/path/'
  }, overrides);
}

function jsonResponse (body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function memoryStorage () {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); }
  };
}

// Install a global.fetch mock serving discovery + a configurable token response.
// Returns a handle exposing the captured token request and lets tests override
// the token response.
function installFetchMock () {
  const state = { tokenResponse: jsonResponse(tokenBody()), lastTokenRequest: null, discovery: null, tokenRequestCount: 0 };
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input && input.url ? input.url : input);
    if (url.includes('.well-known/oauth-authorization-server')) {
      return jsonResponse(state.discovery || DISCOVERY);
    }
    if (url === DISCOVERY.token_endpoint) {
      state.tokenRequestCount++;
      state.lastTokenRequest = { url, init, body: init && init.body ? init.body.toString() : '' };
      // A Response body is single-use; clone so a test can reuse one response
      // object across sequential requests without an "already read" error.
      return (state.tokenResponse instanceof Response) ? state.tokenResponse.clone() : state.tokenResponse;
    }
    throw new Error('unexpected fetch: ' + url);
  };
  state.restore = () => { globalThis.fetch = original; };
  return state;
}

function newClient (storage, overrides = {}) {
  return new OAuth2Client(Object.assign({
    authorizationServer: ISSUER,
    clientId: 'app1',
    redirectUri: 'https://app.example/cb',
    scope: 'cmc:study-A',
    storage
  }, overrides));
}

describe('[OAUTH-LIB] OAuth2Client', function () {
  let fetchMock;
  beforeEach(function () { fetchMock = installFetchMock(); });
  afterEach(function () { fetchMock.restore(); });

  describe('[OAL-CTOR] constructor validation', function () {
    it('[OAL-C1] throws without authorizationServer', function () {
      expect(() => new OAuth2Client({ clientId: 'a', redirectUri: 'b' }))
        .to.throw(/authorizationServer/);
    });
    it('[OAL-C2] throws without clientId', function () {
      expect(() => new OAuth2Client({ authorizationServer: ISSUER, redirectUri: 'b' }))
        .to.throw(/clientId/);
    });
    it('[OAL-C3] throws without redirectUri', function () {
      expect(() => new OAuth2Client({ authorizationServer: ISSUER, clientId: 'a' }))
        .to.throw(/redirectUri/);
    });
  });

  describe('[OAL-AUTH] redirectToAuthorize', function () {
    it('[OAL-A1] builds the authorize URL with all required params', async function () {
      const storage = memoryStorage();
      const client = newClient(storage);
      const url = await client.redirectToAuthorize({ state: 'STATE123' });
      const u = new URL(url);
      expect(u.origin + u.pathname).to.equal(DISCOVERY.authorization_endpoint);
      expect(u.searchParams.get('response_type')).to.equal('code');
      expect(u.searchParams.get('client_id')).to.equal('app1');
      expect(u.searchParams.get('redirect_uri')).to.equal('https://app.example/cb');
      expect(u.searchParams.get('scope')).to.equal('cmc:study-A');
      expect(u.searchParams.get('state')).to.equal('STATE123');
      expect(u.searchParams.get('code_challenge_method')).to.equal('S256');
    });

    it('[OAL-A2] stores a PKCE verifier keyed by state; challenge = base64url(sha256(verifier))', async function () {
      const storage = memoryStorage();
      const client = newClient(storage);
      const url = await client.redirectToAuthorize({ state: 'S' });
      const verifier = storage.getItem('pryv-oauth2-verifier:S');
      expect(verifier).to.be.a('string').with.length.greaterThan(42);
      const challenge = new URL(url).searchParams.get('code_challenge');
      expect(challenge).to.match(/^[A-Za-z0-9_-]{43}$/);
      const expected = await oauth.calculatePKCECodeChallenge(verifier);
      expect(challenge).to.equal(expected);
    });

    it('[OAL-A3] generates a random state when none is supplied', async function () {
      const storage = memoryStorage();
      const client = newClient(storage);
      const url = await client.redirectToAuthorize();
      const state = new URL(url).searchParams.get('state');
      expect(state).to.be.a('string').with.length.greaterThan(0);
      expect(storage.getItem('pryv-oauth2-verifier:' + state)).to.be.a('string');
    });

    it('[OAL-A4] invokes the provided redirect function with the URL', async function () {
      const storage = memoryStorage();
      const client = newClient(storage);
      let redirected = null;
      const url = await client.redirectToAuthorize({ state: 'S', redirect: (u) => { redirected = u; } });
      expect(redirected).to.equal(url);
    });

    it('[OAL-A5] omits scope from the URL when not configured', async function () {
      const storage = memoryStorage();
      const client = newClient(storage, { scope: undefined });
      const url = await client.redirectToAuthorize({ state: 'S' });
      expect(new URL(url).searchParams.has('scope')).to.equal(false);
    });

    it('[OAL-A6] allows an http authorization_endpoint on a loopback host (local dev)', async function () {
      const storage = memoryStorage();
      fetchMock.discovery = Object.assign({}, DISCOVERY, {
        authorization_endpoint: 'http://127.0.0.1:3000/oauth2/authorize'
      });
      const client = newClient(storage);
      const url = await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      expect(new URL(url).protocol).to.equal('http:');
      expect(new URL(url).hostname).to.equal('127.0.0.1');
    });

    it('[OAL-A7] refuses a non-loopback http authorization_endpoint (MITM discovery)', async function () {
      const storage = memoryStorage();
      fetchMock.discovery = Object.assign({}, DISCOVERY, {
        authorization_endpoint: 'http://evil.example/oauth2/authorize'
      });
      const client = newClient(storage);
      let navigated = null;
      await expect(client.redirectToAuthorize({ state: 'S', redirect: (u) => { navigated = u; } }))
        .to.be.rejectedWith(/insecure|https/);
      expect(navigated).to.equal(null); // never navigated the browser
    });

    it('[OAL-A8] refuses a javascript: authorization_endpoint', async function () {
      const storage = memoryStorage();
      fetchMock.discovery = Object.assign({}, DISCOVERY, {
        authorization_endpoint: 'javascript:alert(document.cookie)'
      });
      const client = newClient(storage);
      await expect(client.redirectToAuthorize({ state: 'S', redirect: () => {} }))
        .to.be.rejectedWith(/insecure|https/);
    });
  });

  describe('[OAL-CB] handleCallback', function () {
    async function primedClient (storage) {
      const client = newClient(storage);
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      return client;
    }

    it('[OAL-B1] exchanges the code and returns a Connection built from apiEndpoint', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      const connection = await client.handleCallback('?code=CODE&state=S');
      expect(connection.constructor.name).to.equal('Connection');
      expect(connection.token).to.equal('TOKEN123');
      expect(connection.endpoint).to.equal('https://host/path/');
    });

    it('[OAL-B2] sends grant_type=authorization_code + the PKCE verifier to the token endpoint', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      const verifier = storage.getItem('pryv-oauth2-verifier:S');
      await client.handleCallback('?code=CODE&state=S');
      const body = new URLSearchParams(fetchMock.lastTokenRequest.body);
      expect(body.get('grant_type')).to.equal('authorization_code');
      expect(body.get('code')).to.equal('CODE');
      expect(body.get('code_verifier')).to.equal(verifier);
      expect(body.get('redirect_uri')).to.equal('https://app.example/cb');
    });

    it('[OAL-B3] removes the stored verifier after a successful exchange', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      await client.handleCallback('?code=CODE&state=S');
      expect(storage.getItem('pryv-oauth2-verifier:S')).to.equal(null);
    });

    it('[OAL-B4] accepts a query string without a leading question mark', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      const connection = await client.handleCallback('code=CODE&state=S');
      expect(connection.token).to.equal('TOKEN123');
    });

    it('[OAL-B5] throws when the callback has no state', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      await expect(client.handleCallback('?code=CODE')).to.be.rejectedWith(/state/);
    });

    it('[OAL-B6] throws when no verifier is stored for the state (forged/expired)', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      await expect(client.handleCallback('?code=CODE&state=OTHER')).to.be.rejectedWith(/verifier/);
    });

    it('[OAL-B7] throws when the token response lacks the apiEndpoint extension', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      const body = tokenBody();
      delete body.apiEndpoint;
      fetchMock.tokenResponse = jsonResponse(body);
      await expect(client.handleCallback('?code=CODE&state=S')).to.be.rejectedWith(/apiEndpoint/);
    });

    it('[OAL-B8] removes the stored verifier even when the exchange fails', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      const body = tokenBody();
      delete body.apiEndpoint; // force _connectionFromTokenResponse to throw
      fetchMock.tokenResponse = jsonResponse(body);
      await expect(client.handleCallback('?code=CODE&state=S')).to.be.rejected;
      expect(storage.getItem('pryv-oauth2-verifier:S')).to.equal(null);
    });

    it('[OAL-B9] refuses an insecure (non-https, non-loopback) apiEndpoint', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      fetchMock.tokenResponse = jsonResponse(tokenBody({ apiEndpoint: 'http://TOKEN123@evil.example/path/' }));
      await expect(client.handleCallback('?code=CODE&state=S')).to.be.rejectedWith(/insecure|https/);
    });

    it('[OAL-B10] allows an http apiEndpoint on a loopback host (local dev)', async function () {
      const storage = memoryStorage();
      const client = await primedClient(storage);
      fetchMock.tokenResponse = jsonResponse(tokenBody({ apiEndpoint: 'http://TOKEN123@127.0.0.1:3000/path/' }));
      const connection = await client.handleCallback('?code=CODE&state=S');
      expect(connection.token).to.equal('TOKEN123');
    });

    it('[OAL-B11] refuses a loopback-spoofing apiEndpoint whose real endpoint is a remote http host', async function () {
      // Connection splits token/endpoint on the LAST `@`, so this parses as
      // token `tok@127.0.0.1/x`, endpoint `http://evil.example/` — the token
      // would go to evil.example in cleartext. The guard must validate the
      // extracted endpoint, not the loopback-looking raw string.
      const storage = memoryStorage();
      const client = await primedClient(storage);
      fetchMock.tokenResponse = jsonResponse(tokenBody({ apiEndpoint: 'http://tok@127.0.0.1/x@evil.example/' }));
      await expect(client.handleCallback('?code=CODE&state=S')).to.be.rejectedWith(/insecure|https/);
    });
  });

  describe('[OAL-RF] refresh', function () {
    it('[OAL-R1] throws before any successful callback', async function () {
      const storage = memoryStorage();
      const client = newClient(storage);
      await expect(client.refresh()).to.be.rejectedWith(/refresh token/);
    });

    it('[OAL-R2] exchanges the stored refresh token for a fresh Connection', async function () {
      const storage = memoryStorage();
      const client = newClient(storage);
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      await client.handleCallback('?code=CODE&state=S');
      fetchMock.tokenResponse = jsonResponse(tokenBody({
        access_token: 'TOKEN789',
        apiEndpoint: 'https://TOKEN789@host/path/'
      }));
      const connection = await client.refresh();
      expect(connection.token).to.equal('TOKEN789');
      const body = new URLSearchParams(fetchMock.lastTokenRequest.body);
      expect(body.get('grant_type')).to.equal('refresh_token');
      expect(body.get('refresh_token')).to.equal('REFRESH456');
    });

    async function primed (storage, overrides = {}) {
      const client = newClient(storage, overrides);
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      await client.handleCallback('?code=CODE&state=S');
      return client;
    }

    it('[OAL-R3-F1] serializes concurrent refresh() onto ONE token request', async function () {
      const client = await primed(memoryStorage());
      fetchMock.tokenResponse = jsonResponse(tokenBody({ access_token: 'T2', refresh_token: 'R2', apiEndpoint: 'https://T2@host/p/' }));
      fetchMock.tokenRequestCount = 0;
      const [c1, c2] = await Promise.all([client.refresh(), client.refresh()]);
      expect(fetchMock.tokenRequestCount).to.equal(1); // deduped, no reuse loser
      expect(c1.token).to.equal('T2');
      expect(c2.token).to.equal('T2');
    });

    it('[OAL-R4-F1] a new refresh() after the in-flight one settles issues a fresh request', async function () {
      const client = await primed(memoryStorage());
      fetchMock.tokenResponse = jsonResponse(tokenBody({ refresh_token: 'R2', apiEndpoint: 'https://T2@host/p/' }));
      await client.refresh();
      fetchMock.tokenRequestCount = 0;
      await client.refresh();
      expect(fetchMock.tokenRequestCount).to.equal(1); // slot cleared, not stuck
    });

    it('[OAL-R5-F2] persists the rotated refresh token even when apiEndpoint validation throws', async function () {
      const client = await primed(memoryStorage());
      // Server rotates (REFRESH456 -> ROTATED1) but the response has no apiEndpoint
      // => _connectionFromTokenResponse throws AFTER the token was ingested.
      const bad = tokenBody({ refresh_token: 'ROTATED1' });
      delete bad.apiEndpoint;
      fetchMock.tokenResponse = jsonResponse(bad);
      await expect(client.refresh()).to.be.rejectedWith(/apiEndpoint/);
      // The old token is dead server-side; the client must now hold ROTATED1,
      // and a subsequent refresh() must present it (not the stale REFRESH456).
      expect(client.refreshToken).to.equal('ROTATED1');
      fetchMock.tokenResponse = jsonResponse(tokenBody({ access_token: 'T3', refresh_token: 'R3', apiEndpoint: 'https://T3@host/p/' }));
      const conn = await client.refresh();
      expect(conn.token).to.equal('T3');
      expect(new URLSearchParams(fetchMock.lastTokenRequest.body).get('refresh_token')).to.equal('ROTATED1');
    });
  });

  describe('[OAL-SEAM] refresh-token persistence seam (F3)', function () {
    it('[OAL-S1] refresh() works from a constructor-seeded refresh token (no handleCallback)', async function () {
      const client = newClient(memoryStorage(), { refreshToken: 'SEEDED' });
      fetchMock.tokenResponse = jsonResponse(tokenBody({ access_token: 'T2', apiEndpoint: 'https://T2@host/p/' }));
      const conn = await client.refresh();
      expect(conn.token).to.equal('T2');
      expect(new URLSearchParams(fetchMock.lastTokenRequest.body).get('refresh_token')).to.equal('SEEDED');
    });

    it('[OAL-S2] the refreshToken getter reflects the rotated value', async function () {
      const client = newClient(memoryStorage(), { refreshToken: 'SEEDED' });
      expect(client.refreshToken).to.equal('SEEDED');
      fetchMock.tokenResponse = jsonResponse(tokenBody({ refresh_token: 'ROTATED', apiEndpoint: 'https://T2@host/p/' }));
      await client.refresh();
      expect(client.refreshToken).to.equal('ROTATED');
    });

    it('[OAL-S3] onTokenRotated fires with the new token on callback and each refresh', async function () {
      const storage = memoryStorage();
      const rotations = [];
      const client = newClient(storage, { onTokenRotated: (t) => rotations.push(t) });
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      await client.handleCallback('?code=CODE&state=S'); // REFRESH456
      fetchMock.tokenResponse = jsonResponse(tokenBody({ refresh_token: 'ROTATED', apiEndpoint: 'https://T2@host/p/' }));
      await client.refresh();
      expect(rotations).to.deep.equal(['REFRESH456', 'ROTATED']);
    });

    it('[OAL-S4] a throwing onTokenRotated never breaks the exchange', async function () {
      const client = newClient(memoryStorage(), {
        refreshToken: 'SEEDED',
        onTokenRotated: () => { throw new Error('persist boom'); }
      });
      fetchMock.tokenResponse = jsonResponse(tokenBody({ access_token: 'T2', apiEndpoint: 'https://T2@host/p/' }));
      const conn = await client.refresh();
      expect(conn.token).to.equal('T2');
    });
  });

  describe('[OAL-DPOP] DPoP option (RFC 9449)', function () {
    function headerValue (init, name) {
      const h = init && init.headers;
      if (h == null) return null;
      if (typeof h.get === 'function') return h.get(name);
      const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase());
      return key ? h[key] : null;
    }
    const dpopTokenBody = (o = {}) => tokenBody(Object.assign({ token_type: 'DPoP' }, o));

    it('[OAL-DP1] handleCallback with dpop:true returns a SignedConnection and sends a DPoP proof on the token request', async function () {
      fetchMock.tokenResponse = jsonResponse(dpopTokenBody());
      const client = newClient(memoryStorage(), { dpop: true });
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      const connection = await client.handleCallback('?code=CODE&state=S');
      expect(connection.constructor.name).to.equal('SignedConnection');
      expect(connection.token).to.equal('TOKEN123');
      const proof = headerValue(fetchMock.lastTokenRequest.init, 'DPoP');
      expect(proof, 'token request carries a DPoP header').to.be.a('string');
      expect(proof.split('.')).to.have.length(3); // compact JWS
    });

    it('[OAL-DP2] default (no dpop) sends NO DPoP header and returns a plain Connection', async function () {
      const client = newClient(memoryStorage());
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      const connection = await client.handleCallback('?code=CODE&state=S');
      expect(connection.constructor.name).to.equal('Connection');
      expect(headerValue(fetchMock.lastTokenRequest.init, 'DPoP')).to.equal(null);
    });

    it('[OAL-DP3] refresh() keeps the DPoP binding — SignedConnection with the same key, proof on the request', async function () {
      fetchMock.tokenResponse = jsonResponse(dpopTokenBody());
      const client = newClient(memoryStorage(), { dpop: true });
      await client.redirectToAuthorize({ state: 'S', redirect: () => {} });
      const first = await client.handleCallback('?code=CODE&state=S');
      fetchMock.tokenResponse = jsonResponse(dpopTokenBody({ access_token: 'TOKEN789', apiEndpoint: 'https://TOKEN789@host/path/' }));
      const refreshed = await client.refresh();
      expect(refreshed.constructor.name).to.equal('SignedConnection');
      expect(refreshed.token).to.equal('TOKEN789');
      // Same key pair reused across the flow (binding is stable).
      expect(refreshed._dpopKeyPair).to.equal(first._dpopKeyPair);
      expect(headerValue(fetchMock.lastTokenRequest.init, 'DPoP')).to.be.a('string');
    });
  });
});
