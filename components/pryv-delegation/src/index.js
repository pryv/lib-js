/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * @pryv/delegation — account-delegation client helpers.
 *
 * Thin, typed wrapper over a personal `pryv.Connection` for the server-side
 * `delegations.*` API family (open-pryv.io `delegation` plugin). Account
 * delegation lets one account (the "delegate", A) act on behalf of another
 * (the "controlled" account, B) through a delegate personal-access token (PAT)
 * minted on B — e.g. a parent running a child's account, or a co-guardian
 * added to an existing one.
 *
 * Two sides of one relationship:
 *   - B (the controlled account) invites a delegate, and is the ONLY party
 *     that can authoritatively detach one (genuine login required).
 *   - A (the delegate) accepts/refuses the invite, lists the accounts it
 *     controls, mints a token for one, and can create brand-new controlled
 *     accounts.
 *
 * Every method here maps to exactly one `delegations.*` API method, issued
 * through `connection.apiOne(...)` (batch call). Errors carrying a
 * `delegation-*` id surface as a typed {@link DelegationError} whose `.id`
 * matches one of {@link errorIds}, so callers branch on a stable constant
 * instead of parsing English `error.message`.
 *
 * See server-side `open-pryv.io/components/delegation/` +
 * `components/api-server/src/{routes,methods}/delegations.ts`.
 */

// --- Relationship status ---------------------------------------------------
// Mirrors the server `STATUS` enum (components/delegation/src/constants.ts).
// `listDelegates()` / `listControlled()` entries carry one of these.
const STATUS = Object.freeze({
  /** A pending invite: sent (B side) / received (A side), not yet accepted. */
  INVITE: 'invite',
  /** An active relationship: the delegate holds (or can mint) a live PAT. */
  ACTIVE: 'active',
  /**
   * A's local mirror discovered the relationship was torn down on B (a token
   * mint answered 401/403). Advisory only — carries no authority; the row is
   * user-dismissable via `dismissControlled(...)`.
   */
  STALE: 'stale'
});

// --- Typed error catalogue -------------------------------------------------
// Mirror of the server-side DelegationErrorIds
// (components/delegation/src/errorIds.ts). Match on these constants when a
// `delegations.*` call rejects, instead of parsing `error.message`.
const errorIds = Object.freeze({
  // Guard hooks (a generic accesses/events/streams write hit a plugin-owned
  // namespace — should not occur through this client, surfaced for safety).
  CLIENTDATA_FORBIDDEN: 'delegation-clientdata-forbidden',
  MANAGED_RESOURCE: 'delegation-managed-resource',
  RESERVED_STREAM: 'delegation-reserved-stream',
  // Handshake / lifecycle.
  UNKNOWN_USERNAME: 'delegation-unknown-username',
  SELF_NOT_ALLOWED: 'delegation-self-not-allowed',
  DELEGATE_MISMATCH: 'delegation-delegate-mismatch',
  ALREADY_EXISTS: 'delegation-already-exists',
  DELIVERY_FAILED: 'delegation-delivery-failed',
  /**
   * The operation (detach / cancel) requires a genuine, freshly-authenticated
   * login on the controlled account — a delegate PAT or control token cannot
   * remove a delegation relationship. The UI must prompt the account owner to
   * log in directly before retrying.
   */
  GENUINE_LOGIN_REQUIRED: 'delegation-genuine-login-required',
  NOT_FOUND: 'delegation-not-found',
  INVITE_EXPIRED: 'delegation-invite-expired',
  NOT_ACTIVE: 'delegation-not-active',
  USERNAME_TAKEN: 'delegation-username-taken',
  UNKNOWN_CORE: 'delegation-unknown-core',
  CREATION_FAILED: 'delegation-creation-failed',
  PERSONAL_TOKEN_REQUIRED: 'delegation-personal-token-required',
  MIRROR_NOT_STALE: 'delegation-mirror-not-stale',
  /**
   * A delegate token, or an access granted through the delegation, tried to
   * create a durable grant on the controlled account through a path that
   * records no delegation lineage (CMC consent accept / scope update /
   * request). Only the account owner can.
   */
  GRANT_REQUIRES_OWNER: 'delegation-grant-requires-owner'
});

const DELEGATION_ID_VALUES = new Set(Object.values(errorIds));

/**
 * Typed error surfaced by {@link Delegation} methods when a `delegations.*`
 * call rejects with a `delegation-*` id. `id` is the stable kebab-case string
 * (one of {@link errorIds}); `cause` is the underlying `pryv` error; `data`
 * is the server error's `data` payload when present.
 */
class DelegationError extends Error {
  constructor (message, id, cause, data) {
    super(message);
    this.name = 'DelegationError';
    this.id = id;
    if (cause !== undefined) this.cause = cause;
    if (data !== undefined) this.data = data;
  }
}

/**
 * Extract a Pryv API `error.id` from a thrown error, across the shapes the
 * `pryv` client uses. `connection.apiOne` throws a `PryvError` whose
 * `innerObject` is the batch call's `error` object (`{ id, message, data }`);
 * `PryvError.fromApiResponse` sets `.id` / `.response` directly. Check all.
 */
function errorIdFrom (err) {
  if (err == null) return null;
  if (typeof err.id === 'string') return err.id;
  const inner = err.innerObject;
  if (inner != null) {
    if (typeof inner.id === 'string') return inner.id;
    if (inner.error != null && typeof inner.error.id === 'string') return inner.error.id;
  }
  const resp = err.response;
  if (resp != null && resp.body != null && resp.body.error != null && typeof resp.body.error.id === 'string') {
    return resp.body.error.id;
  }
  return null;
}

/** Pull the server error `data` payload from a thrown `pryv` error, if any. */
function errorDataFrom (err) {
  if (err == null) return undefined;
  const inner = err.innerObject;
  if (inner != null) {
    if (inner.data !== undefined) return inner.data;
    if (inner.error != null && inner.error.data !== undefined) return inner.error.data;
  }
  const resp = err.response;
  if (resp != null && resp.body != null && resp.body.error != null) return resp.body.error.data;
  return undefined;
}

/**
 * Map a thrown `pryv` error to a {@link DelegationError} when it carries a
 * `delegation-*` id; otherwise return it unchanged so transport / validation
 * errors propagate as-is.
 */
function toDelegationError (err) {
  const id = errorIdFrom(err);
  if (id != null && (DELEGATION_ID_VALUES.has(id) || id.startsWith('delegation-'))) {
    const message = (err && err.message) || id;
    return new DelegationError(message, id, err, errorDataFrom(err));
  }
  return err;
}

/**
 * Client for the `delegations.*` API family, bound to one personal
 * `pryv.Connection`. Construct via {@link Delegation.fromConnection}.
 */
class Delegation {
  /**
   * @param {Object} connection  a personal `pryv.Connection`.
   * @param {Object} [opts]
   * @param {Object} [opts.pryv]  explicit `pryv` module (otherwise resolved
   *   via `require('pryv')`; pass it in browser bundles where `require` is
   *   unavailable — needed only by `openControlled`).
   */
  constructor (connection, opts) {
    if (connection == null) throw new Error('Delegation: a pryv.Connection is required');
    this.connection = connection;
    this._pryvModule = (opts && opts.pryv) || null;
  }

  /**
   * Wrap a personal `pryv.Connection` in a {@link Delegation} client.
   * @param {Object} connection  a personal `pryv.Connection`.
   * @param {Object} [opts]  see the constructor.
   * @returns {Delegation}
   */
  static fromConnection (connection, opts) {
    return new Delegation(connection, opts);
  }

  /** @private Resolve the `pryv` module (explicit opt or lazy require). */
  _getPryv () {
    if (this._pryvModule != null) return this._pryvModule;
    this._pryvModule = require('pryv');
    return this._pryvModule;
  }

  /** @private One batch call, remapping `delegation-*` errors to DelegationError. */
  async _apiOne (method, params, expectedKey) {
    try {
      return await this.connection.apiOne(method, params || {}, expectedKey);
    } catch (err) {
      throw toDelegationError(err);
    }
  }

  // ---- B side (the controlled account) ----------------------------------

  /**
   * B invites a delegate. `POST /delegations/attach-request`.
   * A delegate PAT acting as B MAY call this (that is how a delegate adds a
   * co-delegate).
   *
   * @param {string} delegateUsername  the account to invite as delegate.
   * @returns {Promise<DelegationRecord>} the pending invite record
   *   `{ relId, delegate:{username}, status:'invite', requestedAt, expiresAt }`.
   */
  async requestAttach (delegateUsername) {
    return await this._apiOne('delegations.requestAttach', { delegateUsername }, 'delegation');
  }

  /**
   * B cancels a pending invite it issued. `POST /delegations/delegates/{username}/cancel`.
   * Genuine-login-gated on B (a delegate PAT cannot cancel B's invites) →
   * may throw {@link DelegationError} `delegation-genuine-login-required`.
   *
   * @param {string} delegateUsername  the invited delegate to cancel.
   * @returns {Promise<void>}
   */
  async cancelInvite (delegateUsername) {
    await this._apiOne('delegations.cancelInvite', { username: delegateUsername });
  }

  /**
   * List the delegates of the connected (B) account. `GET /delegations/delegates`.
   *
   * @returns {Promise<DelegateRecord[]>} each `{ relId, delegate:{username,
   *   hostSlug}, status, requestedAt, activatedAt?, lastTokenIssuedAt? }`.
   */
  async listDelegates () {
    return await this._apiOne('delegations.listDelegates', {}, 'delegates');
  }

  /**
   * B detaches a delegate — THE authoritative teardown. `DELETE
   * /delegations/delegates/{username}`. Removes the delegate's PAT + all
   * marker accesses on B (active), or cancels the pending invite.
   *
   * **Requires a genuine login on B.** A delegate PAT or control token is
   * rejected with {@link DelegationError} `delegation-genuine-login-required`
   * — surface it distinctly so the UI can explain the account owner must log
   * in directly (not through a delegated session) to remove a delegate.
   *
   * @param {string} delegateUsername  the delegate to detach.
   * @returns {Promise<void>}
   */
  async detachDelegate (delegateUsername) {
    await this._apiOne('delegations.detachDelegate', { username: delegateUsername });
  }

  // ---- A side (the delegate) --------------------------------------------

  /**
   * A accepts a pending invite from a controlled account.
   * `POST /delegations/controlled/{username}/accept`.
   *
   * @param {string} controlledUsername  the inviting account.
   * @returns {Promise<DelegationRecord>} `{ relId, controlled:{username},
   *   status:'active', activatedAt }`.
   */
  async acceptAttach (controlledUsername) {
    return await this._apiOne('delegations.acceptAttach', { username: controlledUsername }, 'delegation');
  }

  /**
   * A refuses a pending invite. `POST /delegations/controlled/{username}/refuse`.
   * A unilateral decline (not a detach) — gated on A's personal token.
   *
   * @param {string} controlledUsername  the inviting account.
   * @returns {Promise<void>}
   */
  async refuseAttach (controlledUsername) {
    await this._apiOne('delegations.refuseAttach', { username: controlledUsername });
  }

  /**
   * List the accounts the connected (A) account controls.
   * `GET /delegations/controlled`.
   *
   * @returns {Promise<ControlledRecord[]>} each `{ relId, controlled:{username,
   *   hostSlug}, status, requestedAt, activatedAt? }`. `status` may be
   *   `'stale'` — see {@link dismissControlled}.
   */
  async listControlled () {
    return await this._apiOne('delegations.listControlled', {}, 'controlled');
  }

  /**
   * A dismisses a local `stale` mirror row (housekeeping). `DELETE
   * /delegations/controlled/{username}`. Removes no authority and never
   * touches B; rejects a non-stale mirror with `delegation-mirror-not-stale`.
   *
   * @param {string} controlledUsername  the stale controlled account to drop.
   * @returns {Promise<void>}
   */
  async dismissControlled (controlledUsername) {
    await this._apiOne('delegations.dismissControlled', { username: controlledUsername });
  }

  /**
   * A mints (or refreshes) a delegate PAT for an active controlled account.
   * `POST /delegations/controlled/{username}/token`. On a torn-down
   * relationship the mirror flips to `stale` and this throws
   * {@link DelegationError} `delegation-not-active`.
   *
   * @param {string} controlledUsername  the controlled account.
   * @returns {Promise<{token: string, apiEndpoint: string}>} the delegate PAT
   *   and the controlled account's API base — use them to talk to B directly.
   */
  async getToken (controlledUsername) {
    const res = await this._apiOne('delegations.getToken', { username: controlledUsername });
    return { token: res.token, apiEndpoint: res.apiEndpoint };
  }

  /**
   * One-call "act as the controlled account": mint a token and return a ready
   * `pryv.Connection` onto the controlled account (B).
   *
   * Composes {@link getToken} + connection construction. Needs the `pryv`
   * module — resolved via `require('pryv')` in Node, or the `opts.pryv` passed
   * to {@link Delegation.fromConnection} in a browser bundle.
   *
   * @param {string} controlledUsername  the controlled account.
   * @returns {Promise<Object>} a `pryv.Connection` authenticated as B.
   */
  async openControlled (controlledUsername) {
    const { token, apiEndpoint } = await this.getToken(controlledUsername);
    const pryv = this._getPryv();
    // getToken returns the token + the controlled core's API base separately;
    // fold them into one token-bearing apiEndpoint the Connection accepts.
    const { endpoint } = pryv.utils.extractTokenAndAPIEndpoint(apiEndpoint);
    const fullApiEndpoint = pryv.utils.buildAPIEndpoint({ endpoint, token });
    return new pryv.Connection(fullApiEndpoint);
  }

  /**
   * A creates a brand-new controlled account, active at birth.
   * `POST /delegations/controlled`. `email` / `password` are optional — a
   * password-less account is reachable only through delegates until one sets
   * a password. `core` picks the target core (default = A's own).
   *
   * @param {Object} params
   * @param {string} params.username   the new account's username.
   * @param {string} [params.email]    optional email.
   * @param {string} [params.password] optional password (random if omitted).
   * @param {string} [params.core]     optional target core (id or URL).
   * @param {string} [params.language] optional preferred language.
   * @returns {Promise<{delegation: DelegationRecord, apiEndpoint?: string}>}
   */
  async createAccount (params) {
    if (params == null || typeof params.username !== 'string' || params.username.length === 0) {
      throw new Error('createAccount: params.username is required');
    }
    const body = { username: params.username };
    if (params.email !== undefined) body.email = params.email;
    if (params.password !== undefined) body.password = params.password;
    if (params.core !== undefined) body.core = params.core;
    if (params.language !== undefined) body.language = params.language;
    const res = await this._apiOne('delegations.createAccount', body);
    return { delegation: res.delegation, apiEndpoint: res.apiEndpoint };
  }
}

module.exports = {
  Delegation,
  DelegationError,
  errorIds,
  STATUS
};
