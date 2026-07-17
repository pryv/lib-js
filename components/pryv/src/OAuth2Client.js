/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const oauth = require('oauth4webapi');
const Connection = require('./Connection');
const utils = require('./utils');

// sessionStorage key prefix for the per-flow PKCE verifier, keyed by `state`.
const VERIFIER_KEY_PREFIX = 'pryv-oauth2-verifier:';

/**
 * Minimal Web-Storage-like contract used to persist the per-flow PKCE verifier.
 * A browser `sessionStorage` satisfies it structurally.
 * @typedef {Object} OAuth2Storage
 * @property {(key: string) => (string | null)} getItem
 * @property {(key: string, value: string) => void} setItem
 * @property {(key: string) => void} removeItem
 */

/**
 * @class OAuth2Client
 * Browser-side consumer of the Pryv OAuth2 authorization-code flow (PKCE).
 *
 * Sibling to {@link Browser}: an OAuth-aware app runs
 * `redirectToAuthorize()` → (the browser bounces through `/oauth2/authorize`
 * and back to `redirectUri`) → `handleCallback()`, which returns a ready
 * {@link Connection}. `refresh()` swaps the refresh token for a fresh one.
 *
 * PKCE is handled internally: a random `code_verifier` is generated per flow,
 * stored in `sessionStorage` keyed by `state`, and consumed on callback.
 *
 * The authorization-server endpoints are discovered from the issuer via
 * RFC 8414 (`GET <issuer>/.well-known/oauth-authorization-server`).
 *
 * @example
 * const client = new pryv.OAuth2Client({
 *   authorizationServer: 'https://host', // Pryv API base (issuer)
 *   clientId: 'my-app',
 *   redirectUri: 'https://my-app.example/callback',
 *   scope: 'cmc:study-A'
 * });
 * // on "Login with Pryv":
 * await client.redirectToAuthorize();
 * // on the redirect_uri page:
 * const connection = await client.handleCallback(window.location.search);
 *
 * @memberof pryv
 */
class OAuth2Client {
  /**
   * @param {Object} [options]
   * @param {string} [options.authorizationServer] - Issuer / Pryv API base URL. The
   *   discovery document is fetched from `<authorizationServer>/.well-known/oauth-authorization-server`.
   *   (This is the concrete issuer URL, not the `/service/info` URL — client-side
   *   derivation from the per-user `service:api` template is unreliable for multi-core.)
   *   Required at runtime.
   * @param {string} [options.clientId] - App-account client id. Required at runtime.
   * @param {string} [options.redirectUri] - Registered redirect URI. Required at runtime.
   * @param {string} [options.scope] - Consent-offer reference registered on the client, e.g. `'cmc:study-A'`.
   * @param {OAuth2Storage} [options.storage] - Web-Storage-like `{ getItem, setItem, removeItem }`.
   *   Defaults to `globalThis.sessionStorage` in a browser, else an in-memory store.
   * @param {string} [options.refreshToken] - Seed the client with a previously-persisted
   *   refresh token so `refresh()` works after a page reload WITHOUT re-running the
   *   authorization flow. Persist ONLY this value (read it from `client.refreshToken`
   *   or the `onTokenRotated` callback) — never the whole `lastTokenResponse`, which
   *   also carries the access token and so is a larger XSS surface.
   * @param {(refreshToken: string) => void} [options.onTokenRotated] - Called with the
   *   NEW refresh token every time it rotates (after `handleCallback()` and each
   *   `refresh()`), so the app can persist the minimal secret. Exceptions it throws
   *   are swallowed (persistence must not break the token exchange).
   */
  constructor (options = {}) {
    const { authorizationServer, clientId, redirectUri, scope, storage, refreshToken, onTokenRotated } = options;
    if (!authorizationServer) throw new Error('OAuth2Client: "authorizationServer" is required');
    if (!clientId) throw new Error('OAuth2Client: "clientId" is required');
    if (!redirectUri) throw new Error('OAuth2Client: "redirectUri" is required');

    this.issuer = new URL(authorizationServer);
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.storage = storage || defaultStorage();

    // Public client (PKCE, no secret) — token_endpoint auth method "none".
    this._client = { client_id: clientId };
    this._clientAuth = oauth.None();
    this._as = null;
    this._refreshToken = refreshToken || null;
    this._onTokenRotated = (typeof onTokenRotated === 'function') ? onTokenRotated : null;
    // In-flight refresh() promise — dedups concurrent callers onto one token
    // request so they can't each present the same refresh token and have the
    // loser rejected as reuse (invalid_grant) by an always-rotating server.
    this._refreshInFlight = null;
    /** Last raw token-endpoint response (access_token, scope, apiEndpoint, …). */
    this.lastTokenResponse = null;
  }

  /**
   * The current refresh token (rotates on every `handleCallback()` / `refresh()`).
   * Read it to persist the minimal secret across reloads; re-seed via the
   * `refreshToken` constructor option. `null` before the first exchange.
   * @returns {string | null}
   */
  get refreshToken () {
    return this._refreshToken;
  }

  /**
   * @private
   * Lazily discover + cache the authorization-server metadata (RFC 8414).
   * @returns {Promise<Object>} the `AuthorizationServer` metadata
   */
  async _discover () {
    if (this._as) return this._as;
    const response = await oauth.discoveryRequest(this.issuer, { algorithm: 'oauth2' });
    this._as = await oauth.processDiscoveryResponse(this.issuer, response);
    return this._as;
  }

  /**
   * Build the `/oauth2/authorize` URL (generating + storing the PKCE verifier)
   * and navigate to it. Returns the URL so non-browser callers can drive the
   * redirect themselves.
   *
   * @param {Object} [options]
   * @param {string} [options.state] - CSRF/correlation value; a random one is generated when omitted.
   * @param {(url: string) => void} [options.redirect] - Navigation function; defaults to
   *   `globalThis.location.assign` when available, else a no-op (URL still returned).
   * @returns {Promise<string>} the authorization URL
   */
  async redirectToAuthorize (options = {}) {
    const as = await this._discover();
    const state = options.state || oauth.generateRandomState();
    const codeVerifier = oauth.generateRandomCodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);
    this.storage.setItem(VERIFIER_KEY_PREFIX + state, codeVerifier);

    const url = new URL(as.authorization_endpoint);
    // The browser is about to be navigated to this URL. `oauth4webapi` only
    // enforces https on endpoints it fetches itself, not on this navigation
    // target — a tampered/MITM discovery document could return an http:/other
    // `authorization_endpoint` and send the user somewhere hostile. Assert the
    // scheme with the same https-or-loopback rule used for the apiEndpoint.
    assertHttpsOrLoopback(url, 'authorization_endpoint');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    if (this.scope) url.searchParams.set('scope', this.scope);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);

    const authorizationUrl = url.href;
    const redirect = options.redirect || defaultRedirect;
    redirect(authorizationUrl);
    return authorizationUrl;
  }

  /**
   * Validate the redirect_uri callback, exchange the code for tokens (PKCE),
   * and build a {@link Connection} from the Pryv `apiEndpoint` extension.
   *
   * @param {string} queryString - `window.location.search` (with or without leading `?`).
   * @returns {Promise<Connection>} an authenticated Pryv connection
   */
  async handleCallback (queryString) {
    const as = await this._discover();
    const params = new URLSearchParams(stripLeadingQuestionMark(queryString));

    const state = params.get('state');
    if (!state) throw new Error('OAuth2Client: callback is missing "state"');
    const storageKey = VERIFIER_KEY_PREFIX + state;
    const codeVerifier = this.storage.getItem(storageKey);
    if (!codeVerifier) {
      throw new Error('OAuth2Client: no stored PKCE verifier for this state (expired session or forged callback)');
    }

    // The verifier is single-use and bound to this state; drop it on every
    // exit path (success OR error) so a failed/denied callback never leaves it
    // behind in sessionStorage.
    try {
      // Throws on authorization errors (e.g. access_denied) or a state mismatch.
      const callbackParams = oauth.validateAuthResponse(as, this._client, params, state);
      const response = await oauth.authorizationCodeGrantRequest(
        as, this._client, this._clientAuth, callbackParams, this.redirectUri, codeVerifier
      );
      const result = await oauth.processAuthorizationCodeResponse(as, this._client, response);
      return this._connectionFromTokenResponse(result);
    } finally {
      this.storage.removeItem(storageKey);
    }
  }

  /**
   * Exchange the stored refresh token for a fresh access token and return a
   * new {@link Connection}. Requires a prior successful `handleCallback()`.
   *
   * @returns {Promise<Connection>}
   */
  async refresh () {
    // Serialize concurrent callers onto a single in-flight exchange (F1). An
    // always-rotating server consumes the refresh token on first use, so two
    // parallel refresh() calls presenting the same token would rotate once and
    // have the loser rejected as reuse. Dedup to one request; both callers get
    // the same fresh Connection.
    if (this._refreshInFlight) return this._refreshInFlight;
    this._refreshInFlight = this._doRefresh();
    // Clear the slot once settled (success OR failure) so the next call retries.
    this._refreshInFlight.catch(() => {}).finally(() => { this._refreshInFlight = null; });
    return this._refreshInFlight;
  }

  /**
   * @private
   * The actual refresh exchange, wrapped by `refresh()`'s in-flight dedup.
   * @returns {Promise<Connection>}
   */
  async _doRefresh () {
    if (!this._refreshToken) {
      throw new Error('OAuth2Client: no refresh token available; call handleCallback() first');
    }
    const as = await this._discover();
    const response = await oauth.refreshTokenGrantRequest(as, this._client, this._clientAuth, this._refreshToken);
    const result = await oauth.processRefreshTokenResponse(as, this._client, response);
    return this._connectionFromTokenResponse(result);
  }

  /**
   * @private
   * @param {Object} tokenResponse - a processed token-endpoint response
   * @returns {Connection}
   */
  _connectionFromTokenResponse (tokenResponse) {
    // Persist the rotated refresh token FIRST — before any validation that can
    // throw (F2). The server has already committed the rotation (old token
    // consumed, new one issued in this response). If we validated first and it
    // threw (e.g. a momentarily-missing or http: apiEndpoint), we would strand
    // the client on the now-dead old token AND lose the new one — permanently
    // bricking the session. Storing first lets a later refresh() retry with the
    // current token.
    this._ingestTokens(tokenResponse);

    const apiEndpoint = tokenResponse.apiEndpoint;
    if (!apiEndpoint) {
      throw new Error('OAuth2Client: token response is missing the Pryv "apiEndpoint" extension');
    }
    // Validate the endpoint the Connection will actually send the token to, not
    // the raw apiEndpoint string: Connection splits token/endpoint on the LAST
    // `@` (utils regex), so a crafted `http://tok@127.0.0.1/x@evil/` parses as
    // loopback here but posts the token to `evil` there. Assert on the extracted
    // endpoint to close that parser-divergence gap.
    const { endpoint } = utils.extractTokenAndAPIEndpoint(String(apiEndpoint));
    assertSecureApiEndpoint(endpoint);
    return new Connection(String(apiEndpoint));
  }

  /**
   * @private
   * Non-throwing: record the rotated refresh token + raw response and notify the
   * app so it can persist the minimal secret. Runs before validation so a
   * validation failure never loses the rotation (see `_connectionFromTokenResponse`).
   * @param {Object} tokenResponse - a processed token-endpoint response
   */
  _ingestTokens (tokenResponse) {
    this.lastTokenResponse = tokenResponse;
    if (!tokenResponse.refresh_token) return;
    this._refreshToken = tokenResponse.refresh_token;
    if (this._onTokenRotated) {
      // Persistence must never break the exchange — swallow app callback errors.
      try { this._onTokenRotated(this._refreshToken); } catch (_) { /* ignore */ }
    }
  }
}

/**
 * @private
 * Refuse an `apiEndpoint` that would send the bearer token in cleartext. The
 * token is embedded in the endpoint (`https://<token>@host/`) and then sent on
 * every request, so a non-https endpoint leaks it on the wire. Defense-in-depth
 * against a compromised/misconfigured authorization server.
 * @param {string} apiEndpoint
 */
function assertSecureApiEndpoint (apiEndpoint) {
  assertHttpsOrLoopback(apiEndpoint, 'apiEndpoint');
}

/**
 * @private
 * Enforce a "must be transport-secure" rule on a URL that is either navigated
 * to (the authorize redirect) or used to send the bearer token (the
 * apiEndpoint): allow `https:` everywhere, and `http:` only for loopback hosts
 * (local development). Single source of truth so both call sites stay in sync.
 * @param {string | URL} rawUrl - the URL to check (string or a parsed `URL`)
 * @param {string} label - human-readable name of the value, used in errors
 */
function assertHttpsOrLoopback (rawUrl, label) {
  let url;
  try {
    url = (rawUrl instanceof URL) ? rawUrl : new URL(rawUrl);
  } catch {
    throw new Error('OAuth2Client: ' + label + ' is not a valid URL');
  }
  const host = url.hostname;
  const isLoopback = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
  if (url.protocol === 'https:') return;
  if (url.protocol === 'http:' && isLoopback) return;
  throw new Error('OAuth2Client: refusing insecure ' + label + ' (' + url.protocol + '//' + host + '); https is required');
}

/**
 * @private
 * Default navigation: use the browser's `location.assign` when present,
 * otherwise a no-op (the caller gets the URL back from `redirectToAuthorize`).
 * @param {string} url
 */
function defaultRedirect (url) {
  const loc = (typeof globalThis !== 'undefined') ? globalThis.location : undefined;
  if (loc && typeof loc.assign === 'function') loc.assign(url);
}

/**
 * @private
 * `globalThis.sessionStorage` in a browser, else a process-local in-memory store
 * (sufficient for tests and non-browser callers that inject nothing).
 * @returns {OAuth2Storage}
 */
function defaultStorage () {
  if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) return globalThis.sessionStorage;
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); }
  };
}

/**
 * @private
 * @param {string} queryString
 * @returns {string}
 */
function stripLeadingQuestionMark (queryString) {
  const s = queryString || '';
  return s.charAt(0) === '?' ? s.slice(1) : s;
}

module.exports = OAuth2Client;
