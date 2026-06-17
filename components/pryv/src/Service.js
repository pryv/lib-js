/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('./utils.js');
const PryvError = require('./lib/PryvError.js');
const MfaRequiredError = require('./lib/MfaRequiredError.js');
// Connection is required at the end of this file to allow circular requires.
const Assets = require('./ServiceAssets.js');

/**
 * @class pryv.Service
 * A Pryv.io deployment is a unique "Service", as an example **Pryv Lab** is a service, deployed with the domain name **pryv.me**.
 *
 * `pryv.Service` exposes tools to interact with Pryv.io at a "Platform" level.
 *
 *  ##### Initizalization with a service info URL
```js
const service = new pryv.Service('https://reg.pryv.me/service/info');
```

- With the content of a serviceInfo configuration

Service information properties can be overriden with specific values. This might be usefull to test new designs on production platforms.

```js
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const serviceCustomizations = {
  name: 'Pryv Lab 2',
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
const service = new pryv.Service(serviceInfoUrl, serviceCustomizations);
```

 * @memberof pryv
 *
 * @constructor
 * @param {string} serviceInfoUrl Url point to /service/info of a Pryv platform see: {@link https://api.pryv.com/reference/#service-info}
 */
class Service {
  constructor (serviceInfoUrl, serviceCustomizations) {
    this._serviceInfo = null;
    this._assets = null;
    this._polling = false;
    this._serviceInfoUrl = serviceInfoUrl;
    this._pryvServiceCustomizations = serviceCustomizations;
  }

  /**
   * Return service info parameters info known of fetch it if needed.
   * Example
   *  - name of a platform
   *    `const serviceName = await service.info().name`
   * @see ServiceInfo For details on available properties.
   * @param {boolean} [forceFetch] If true, will force fetching service info.
   * @returns {Promise<ServiceInfo>} Promise to Service info Object
   */
  async info (forceFetch) {
    if (forceFetch || !this._serviceInfo) {
      let baseServiceInfo = {};
      if (this._serviceInfoUrl) {
        const { body } = await utils.fetchGet(this._serviceInfoUrl);
        baseServiceInfo = body;
      }
      Object.assign(baseServiceInfo, this._pryvServiceCustomizations);
      // @ts-ignore - baseServiceInfo is populated from body or customizations
      this.setServiceInfo(baseServiceInfo);
    }
    return this._serviceInfo;
  }

  /**
   * Check if a service supports High Frequency Data Sets
   * @returns {Promise<boolean>} Promise resolving to true if HF is supported
   */
  async supportsHF () {
    const infos = await this.info();
    return (infos.features == null || infos.features.noHF !== true);
  }

  /**
   * Whether the platform supports `events.get` content/clientData query
   * conditions (`features.contentQueries` in service info). Older platforms
   * reject the parameters with a 400 — use this to pick a fallback path.
   * @returns {Promise<boolean>}
   */
  async supportsContentQueries () {
    const infos = await this.info();
    return infos.features != null && infos.features.contentQueries === true;
  }

  /**
   * Check if a service has username in the hostname or in the path of the API.
   * @returns {Promise<boolean>} Promise resolving to true if the service does not rely on DNS to find a host related to a username
   */
  async isDnsLess () {
    const infos = await this.info();
    const hostname = infos.api.split('/')[2];
    return !hostname.includes('{username}');
  }

  /**
   * @private
   * @param {ServiceInfo} serviceInfo
   */
  setServiceInfo (serviceInfo) {
    if (!serviceInfo.name) {
      throw new Error('Invalid data from service/info');
    }
    // cleanup serviceInfo for eventual url not finishing by "/"
    // code will be obsolete with next version of register
    ['access', 'api', 'register'].forEach((key) => {
      if (serviceInfo[key].slice(-1) !== '/') {
        serviceInfo[key] += '/';
      }
    });
    this._serviceInfo = serviceInfo;
  }

  /**
   * Return assets property content
   * @param {boolean} [forceFetch] If true, will force fetching service info.
   * @returns {Promise<ServiceAssets|null>} Promise to ServiceAssets
   */
  async assets (forceFetch) {
    if (!forceFetch && this._assets) {
      return this._assets;
    } else {
      const serviceInfo = await this.info();
      if (!serviceInfo.assets || !serviceInfo.assets.definitions) {
        console.log('Warning: no assets for this service');
        return null;
      }
      this._assets = await Assets.setup(serviceInfo.assets.definitions);
      return this._assets;
    }
  }

  /**
   * Return service info parameters info known or null if not yet loaded
   * @returns {ServiceInfo} Service Info definition
   */
  infoSync () {
    return this._serviceInfo;
  }

  /**
   * Return an API endpoint from a username and token
   * @param {string} username - The username
   * @param {string} [token] - Optional authorization token
   * @returns {Promise<APIEndpoint>} Promise resolving to the API endpoint URL
   */
  async apiEndpointFor (username, token) {
    const serviceInfo = await this.info();
    return Service.buildAPIEndpoint(serviceInfo, username, token);
  }

  /**
   * Return an API endpoint from a username, token and ServiceInfo.
   * This method is rarely used. See **apiEndpointFor** as an alternative.
   * @param {ServiceInfo} serviceInfo - The service info object containing API URL template
   * @param {string} username - The username
   * @param {string} [token] - Optional authorization token
   * @returns {APIEndpoint} The constructed API endpoint URL
   */
  static buildAPIEndpoint (serviceInfo, username, token) {
    const endpoint = serviceInfo.api.replace('{username}', username);
    return utils.buildAPIEndpoint({ endpoint, token });
  }

  /**
   * Issue a "login call on the Service" return a Connection on success
   * **! Warning**: the token of the connection will be a "Personal" token that expires
   * @see https://api.pryv.com/reference-full/#login-user
   * @param {string} username
   * @param {string} password
   * @param {string} appId
   * @param {string} [originHeader=service-info.register] Only for Node.js. If not set will use the register value of service info. In browsers this will overridden by current page location.
   * @throws {Error} on invalid login
   */
  async login (username, password, appId, originHeader) {
    const apiEndpoint = await this.apiEndpointFor(username);

    const headers = {};
    originHeader = originHeader || (await this.info()).register;
    if (!utils.isBrowser()) {
      headers.Origin = originHeader;
    }
    const { response, body } = await utils.fetchPost(
      apiEndpoint + 'auth/login',
      { username, password, appId },
      headers
    );

    if (!response.ok) {
      throw PryvError.fromApiResponse(response, body);
    }

    if (body && body.mfaToken) {
      throw new MfaRequiredError(body.mfaToken, response, body);
    }

    if (!body || !body.token) {
      throw new PryvError(
        'Invalid login response: ' + JSON.stringify(body)
      );
    }
    return new Connection(
      Service.buildAPIEndpoint(await this.info(), username, body.token),
      this // Pre load Connection with service
    );
  }

  /**
   * Re-trigger an MFA challenge (e.g. resend SMS) during a pending login.
   * Use after `login()` threw `MfaRequiredError` if the user needs another
   * SMS code.
   *
   * @param {string} userId
   * @param {string} mfaToken - From `MfaRequiredError.mfaToken`
   * @returns {Promise<void>}
   * @throws {PryvError} on 4xx/5xx (e.g. invalid/expired mfaToken)
   */
  async mfaChallenge (userId, mfaToken) {
    if (!userId || !mfaToken) {
      throw new PryvError('mfaChallenge requires userId and mfaToken');
    }
    const url = await this.apiEndpointFor(userId) + 'mfa/challenge';
    const { response, body } = await utils.fetchPost(url, {}, {
      Authorization: mfaToken
    });
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
  }

  /**
   * Finish an MFA-protected login by submitting the SMS code. Returns a
   * fully-formed `Connection` (parallel to `Service.login`).
   *
   * @param {string} userId
   * @param {string} mfaToken - From `MfaRequiredError.mfaToken`
   * @param {string} code - The SMS verification code
   * @returns {Promise<Connection>}
   * @throws {PryvError} on bad code, expired mfaToken, etc.
   */
  async mfaVerify (userId, mfaToken, code) {
    if (!userId || !mfaToken || code == null) {
      throw new PryvError('mfaVerify requires userId, mfaToken, code');
    }
    const url = await this.apiEndpointFor(userId) + 'mfa/verify';
    const { response, body } = await utils.fetchPost(url, { code }, {
      Authorization: mfaToken
    });
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
    if (!body || !body.token) {
      throw new PryvError(
        'mfa.verify did not return a token: ' + JSON.stringify(body)
      );
    }
    return new Connection(
      Service.buildAPIEndpoint(await this.info(), userId, body.token),
      this
    );
  }

  /**
   * Check whether a username is registered on this service.
   * One round-trip via `POST <register>/<userId>/server`.
   *
   * @param {string} userId - The username to check
   * @returns {Promise<boolean>} `true` if registered, `false` on 404
   * @throws {PryvError} on network errors or non-404 API errors
   */
  async userExists (userId) {
    const serviceInfo = await this.info();
    const url = serviceInfo.register + encodeURIComponent(userId) + '/server';
    const { response, body } = await utils.fetchPost(url, {});
    if (response.ok) return true;
    if (response.status === 404) return false;
    throw PryvError.fromApiResponse(response, body);
  }

  /**
   * Resolve an email address to a username on this service.
   * One round-trip via `GET <register>/<email>/uid`.
   *
   * On multi-core services where the platform stores identifiers hashed,
   * the queried node may not host the user and answers `307` with the
   * home node's URL in `{ server }`. `fetch` follows the redirect
   * transparently; for HTTP clients that do not auto-follow, this method
   * also follows the `{ server }` hint once explicitly.
   *
   * @param {string} email - The email to look up
   * @returns {Promise<string|null>} The username, or `null` if unknown
   * @throws {PryvError} on network errors or non-404 API errors
   */
  async userIdForEmail (email) {
    const serviceInfo = await this.info();
    const url = serviceInfo.register + encodeURIComponent(email) + '/uid';
    let { response, body } = await utils.fetchGet(url);
    if (response.status === 307 && body && body.server) {
      const home = body.server.endsWith('/') ? body.server : body.server + '/';
      const homeUrl = home + 'reg/' + encodeURIComponent(email) + '/uid';
      ({ response, body } = await utils.fetchGet(homeUrl));
    }
    if (response.ok) return (body && (body.uid || body.username)) || null;
    if (response.status === 404) return null;
    throw PryvError.fromApiResponse(response, body);
  }

  /**
   * Fetch the raw hostings tree advertised by `<register>/hostings`.
   *
   * Returns the nested API shape `{ regions: { <region>: { zones:
   * { <zone>: { hostings: { <key>: { name, description, availableCore,
   * available } } } } } } }`. For a flat list ready to render in a UI,
   * use `flatHostings()`.
   *
   * @returns {Promise<Object>} the raw `/reg/hostings` body
   * @throws {PryvError} on non-2xx
   */
  async availableHostings () {
    const serviceInfo = await this.info();
    const { response, body } = await utils.fetchGet(
      serviceInfo.register + 'hostings'
    );
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
    return body;
  }

  /**
   * Flatten `availableHostings()` into a list of `{ key, name, description,
   * region, zone, availableCore, available }` items.
   *
   * @returns {Promise<Array<Object>>}
   * @throws {PryvError} on non-2xx
   */
  async flatHostings () {
    const tree = await this.availableHostings();
    const out = [];
    const regions = (tree && tree.regions) || {};
    for (const [regionKey, region] of Object.entries(regions)) {
      const zones = (region && region.zones) || {};
      for (const [zoneKey, zone] of Object.entries(zones)) {
        const hostings = (zone && zone.hostings) || {};
        for (const [key, h] of Object.entries(hostings)) {
          if (!h) continue;
          out.push({
            key,
            name: h.name,
            description: h.description,
            region: regionKey,
            zone: zoneKey,
            availableCore: h.availableCore,
            available: h.available === true
          });
        }
      }
    }
    return out;
  }

  /**
   * Register a new user on this service.
   *
   * Hides the v1/v2 register endpoint difference. v2 platforms (service
   * version >= 2.0 or >= 1.6) accept camelCase fields at `<register>users`;
   * older v1 service-register expects mixed-case fields at `<register>user`.
   *
   * Pass `hosting: 'auto'` to use the first hosting flagged `available: true`
   * in `flatHostings()` — useful for tests and single-hosting platforms.
   *
   * @param {Object} opts
   * @param {string} opts.username
   * @param {string} opts.password
   * @param {string} opts.email
   * @param {string} opts.hosting - Hosting key (use `service.flatHostings()` to discover) or `'auto'`
   * @param {string} opts.appId
   * @param {string} [opts.language='en']
   * @param {string} [opts.invitationToken='enjoy']
   * @param {string} [opts.referer]
   * @returns {Promise<{ username: string, apiEndpoint: string }>}
   * @throws {PryvError} on duplicate username, weak password, etc.
   */
  async createUser (opts) {
    if (!opts || !opts.username || !opts.password || !opts.email ||
        !opts.hosting || !opts.appId) {
      throw new PryvError(
        'createUser requires username, password, email, hosting, appId'
      );
    }
    const serviceInfo = await this.info();
    const isModern = supportsCamelCaseRegister(serviceInfo.version);
    const language = opts.language || 'en';
    const invitationToken = opts.invitationToken || 'enjoy';

    let hosting = opts.hosting;
    if (hosting === 'auto') {
      const flat = await this.flatHostings();
      const first = flat.find(h => h.available);
      if (!first) {
        throw new PryvError(
          'createUser({ hosting: "auto" }): no hosting flagged available'
        );
      }
      hosting = first.key;
    }

    let url, payload;
    if (isModern) {
      url = serviceInfo.register + 'users';
      payload = {
        appId: opts.appId,
        username: opts.username,
        password: opts.password,
        email: opts.email,
        hosting,
        language,
        invitationToken,
        ...(opts.referer != null && { referer: opts.referer })
      };
    } else {
      url = serviceInfo.register + 'user';
      payload = {
        appid: opts.appId,
        username: opts.username,
        password: opts.password,
        email: opts.email,
        hosting,
        languageCode: language,
        invitationtoken: invitationToken,
        ...(opts.referer != null && { referer: opts.referer })
      };
    }
    const { response, body } = await utils.fetchPost(url, payload);
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
    const apiEndpoint = await this.apiEndpointFor(opts.username);
    return { username: opts.username, apiEndpoint };
  }

  /**
   * Trigger a password-reset email for the given user.
   * Pre-auth — no token required.
   *
   * @param {string} userId
   * @param {string} appId
   * @returns {Promise<void>}
   * @throws {PryvError} on 4xx/5xx
   */
  async requestPasswordReset (userId, appId) {
    if (!userId || !appId) {
      throw new PryvError('requestPasswordReset requires userId and appId');
    }
    const url = await this.apiEndpointFor(userId) +
      'account/request-password-reset';
    const { response, body } = await utils.fetchPost(url, {
      appId,
      username: userId
    });
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
  }

  /**
   * Start an access-request flow. Posts to the platform's auth endpoint
   * (`serviceInfo.access`) and returns the envelope the consumer needs to
   * present an approve-link to the user and poll for completion.
   *
   * `Browser.setupAuth` already wraps this for the high-level browser flow.
   * Use this method when you're a non-browser caller (CLI, native app, bot)
   * or building your own UI on top.
   *
   * @param {Object} authRequest - The auth-request body
   * @param {string} authRequest.requestingAppId
   * @param {Array<{ streamId: string, level: string, defaultName: string }>} authRequest.requestedPermissions
   * @param {string} [authRequest.languageCode='en']
   * @param {string|boolean} [authRequest.returnUrl]
   * @param {string} [authRequest.referer]
   * @param {Object} [authRequest.clientData]
   * @param {string} [authRequest.deviceName]
   * @param {number} [authRequest.expireAfter]
   * @returns {Promise<{ key: string, authUrl: string, poll: string, pollRateMs: number }>}
   * @throws {PryvError} on non-2xx
   */
  async startAccessRequest (authRequest) {
    if (!authRequest || !authRequest.requestingAppId) {
      throw new PryvError(
        'startAccessRequest requires authRequest.requestingAppId'
      );
    }
    const serviceInfo = await this.info();
    const { response, body } = await utils.fetchPost(
      serviceInfo.access,
      authRequest
    );
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
    if (!body || !body.key || !body.poll) {
      throw new PryvError(
        'Invalid access-request response: ' + JSON.stringify(body)
      );
    }
    return {
      key: body.key,
      authUrl: body.authUrl || body.url,
      poll: body.poll,
      pollRateMs: body.poll_rate_ms != null ? body.poll_rate_ms : body.pollRateMs
    };
  }

  /**
   * Poll an in-progress access request once. Accepts either:
   *   - a `key` returned by `startAccessRequest` (poll URL is built from
   *     `serviceInfo.access + key`)
   *   - a full poll URL (use as-is — recommended, since the server-issued
   *     URL is canonical and may include a different subdomain).
   *
   * Returns the raw body. Inspect `body.status` to drive the flow:
   *   - `'NEED_SIGNIN'` → user has not interacted yet; keep polling.
   *   - `'ACCEPTED'`    → `body.apiEndpoint` + `body.username` + `body.token` are set.
   *   - `'REFUSED'`     → user declined.
   *
   * @param {string} keyOrPollUrl
   * @returns {Promise<Object>}
   * @throws {PryvError} on transport errors or non-2xx-and-not-403-REFUSED
   */
  async pollAccessRequest (keyOrPollUrl) {
    if (!keyOrPollUrl) {
      throw new PryvError('pollAccessRequest requires a key or poll URL');
    }
    let pollUrl = keyOrPollUrl;
    if (!/^https?:\/\//.test(keyOrPollUrl)) {
      const serviceInfo = await this.info();
      pollUrl = serviceInfo.access + keyOrPollUrl;
    }
    const { response, body } = await utils.fetchGet(pollUrl);
    // 403 with status=REFUSED is the canonical "user declined" terminal
    // state — treat as a successful poll, not an error (matches the
    // behaviour of `Auth/AuthController.js`).
    if (response.status === 403 && body && body.status === 'REFUSED') {
      return body;
    }
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
    return body;
  }

  /**
   * Resolve a completed auth-flow polling key into a `Connection`.
   *
   * Pairs with `Service.startAccessRequest` / `Service.pollAccessRequest`
   * and the headless polling pattern: the calling app holds only the
   * `key` returned by the auth-flow (not the underlying token /
   * apiEndpoint), and uses this method to build a working `Connection`.
   *
   * The implementation polls `<access>/<key>` once; the call MUST be
   * made while the access is still in the ACCEPTED state (which
   * persists until expiry — see `expireAfter` on the access request).
   *
   * @param {string} key - polling key from `startAccessRequest`
   * @returns {Promise<Connection>}
   * @throws {PryvError} if the key is not ACCEPTED (NEED_SIGNIN, REFUSED, ERROR)
   */
  async connectFromKey (key) {
    if (!key) {
      throw new PryvError('connectFromKey requires a key');
    }
    const body = await this.pollAccessRequest(key);
    if (body.status !== 'ACCEPTED') {
      throw new PryvError(
        'connectFromKey: access is not ACCEPTED (status=' + body.status + ')'
      );
    }
    if (!body.apiEndpoint) {
      throw new PryvError(
        'connectFromKey: ACCEPTED response missing apiEndpoint'
      );
    }
    return new Connection(body.apiEndpoint, this);
  }

  /**
   * Set a new password using a reset token (from the reset email).
   * Pre-auth — no login token required.
   *
   * @param {string} userId
   * @param {string} newPassword
   * @param {string} resetToken
   * @param {string} appId
   * @returns {Promise<void>}
   * @throws {PryvError} on `unknown-or-expired-reset-token`, weak password, etc.
   */
  async resetPassword (userId, newPassword, resetToken, appId) {
    if (!userId || !newPassword || !resetToken || !appId) {
      throw new PryvError(
        'resetPassword requires userId, newPassword, resetToken, appId'
      );
    }
    const url = await this.apiEndpointFor(userId) + 'account/reset-password';
    const { response, body } = await utils.fetchPost(url, {
      username: userId,
      newPassword,
      resetToken,
      appId
    });
    if (!response.ok) throw PryvError.fromApiResponse(response, body);
  }
}

/**
 * Detect whether the platform's service-info `version` supports the modern
 * camelCase register endpoint (`POST /users`). v2 service-register routes
 * both, but v1 platforms only accept the mixed-case `POST /user`.
 *
 * @param {string|undefined} version - service-info `version` field
 * @returns {boolean}
 */
function supportsCamelCaseRegister (version) {
  if (!version || typeof version !== 'string') return true; // optimistic: assume v2+
  const m = /^(\d+)\.(\d+)/.exec(version);
  if (!m) return true;
  const major = parseInt(m[1], 10);
  const minor = parseInt(m[2], 10);
  if (major >= 2) return true;
  if (major === 1 && minor >= 6) return true;
  return false;
}

module.exports = Service;

// Require is done after exports to allow circular references
const Connection = require('./Connection');

/**
 * Object to handle Pryv Service Informations https://api.pryv.com/reference/#service-info
 * @typedef {Object} ServiceInfo
 * @property {string} register The URL of the register service.
 * @property {string} access The URL of the access page.
 * @property {string} api The API endpoint format.
 * @property {string} name The platform name.
 * @property {string} home The URL of the platform's home page.
 * @property {string} support The email or URL of the support page.
 * @property {string} terms The terms and conditions, in plain text or the URL displaying them.
 * @property {string} eventTypes The URL of the list of validated event types.
 * @property {string} [version] The platform version.
 * @property {Object} [assets] Holder for service specific Assets (icons, css, ...)
 * @property {string} [assets.definitions] URL to json object with assets definitions
 * @property {Object} [features] Platform feature flags
 * @property {boolean} [features.noHF] True if HF data is not supported
 * @property {boolean} [features.contentQueries] True if events.get content/clientData query conditions are supported
 */
