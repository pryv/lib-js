/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * @pryv/cmc — CMC (Cross-account Messaging & Consent) client helpers.
 *
 * Mirrors the server plugin's slug + stream-id helpers so app code can
 * build stream-ids deterministically without depending on the server's
 * private modules, plus Level-1 protocol functions that wrap the
 * lifecycle / chat / system / scope-update event writes on top of a
 * `pryv.Connection`. See server-side
 * `open-pryv.io/components/cmc/{IMPLEMENTERS-GUIDE.md,src/{slug,constants}.ts}`.
 *
 * Stream-id model:
 *   :_cmc:                                  reserved root
 *   :_cmc:inbox                             one-shot lifecycle (cross-app)
 *   :_cmc:apps:<app-code>:[<path>:]chats:<counterparty-slug>
 *   :_cmc:apps:<app-code>:[<path>:]collectors:<counterparty-slug>
 *
 * `counterparty-slug` = `<username>--<host-slug>` where host-slug is the
 * host with `.` replaced by `-`.
 */

// --- Constants ---
// All :_cmc:* identifiers compose from NS. If the namespace is ever
// rebranded (e.g. to ':_xchg:' or similar), changing NS alone updates
// every constant + every helper that builds a stream-id.
const NS = ':_cmc:';
const NS_INBOX = NS + 'inbox';
const NS_APPS = NS + 'apps';
const NS_INTERNAL = NS + '_internal';
const NS_INTERNAL_RETRIES = NS_INTERNAL + ':retries';

const ET_REQUEST = 'consent/request-cmc';
const ET_ACCEPT = 'consent/accept-cmc';
const ET_REFUSE = 'consent/refuse-cmc';
const ET_REVOKE = 'consent/revoke-cmc';
const ET_INVALIDATE_LINK = 'consent/invalidate-link-cmc';
const ET_SCOPE_REQUEST = 'consent/scope-request-cmc';
const ET_SCOPE_UPDATE = 'consent/scope-update-cmc';
const ET_CHAT = 'message/chat-cmc';
const ET_SYSTEM_ALERT = 'notification/alert-cmc';
const ET_SYSTEM_ACK = 'notification/ack-cmc';
const ET_SYSTEM_SCOPE_REQUEST = ET_SCOPE_REQUEST;
const ET_SYSTEM_SCOPE_UPDATE = ET_SCOPE_UPDATE;
// Group membership: a member asks the group's core for an access on a
// patient's account (written by the member), and the record of an
// offboarding sweep (written by the server only).
const ET_MEMBER_ACCESS = 'consent/member-access-cmc';
const ET_MEMBER_REVOKE = 'consent/member-revoke-cmc';

const EVENT_TYPES_LIFECYCLE = [ET_REQUEST, ET_ACCEPT, ET_REFUSE, ET_REVOKE];
const EVENT_TYPES_CHAT = [ET_CHAT];
const EVENT_TYPES_SYSTEM = [
  ET_SYSTEM_ALERT,
  ET_SYSTEM_ACK,
  ET_SYSTEM_SCOPE_REQUEST,
  ET_SYSTEM_SCOPE_UPDATE
];

// --- Slug helpers ---

const SEPARATOR = '--';
const SLUG_PIECE_RE = /^[a-z0-9-]+$/;

function assertNonEmpty (label, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('cmc-slug: ' + label + ' must be a non-empty string');
  }
  return value;
}

function assertSlugPiece (label, value) {
  if (!SLUG_PIECE_RE.test(value)) {
    throw new Error(
      'cmc-slug: ' + label + ' "' + value + '" must match ' + SLUG_PIECE_RE.toString()
    );
  }
  if (value.includes(SEPARATOR)) {
    throw new Error(
      'cmc-slug: ' + label + ' "' + value + '" must not contain the double-hyphen separator'
    );
  }
}

/**
 * Slugify a host: lowercase and replace `.` with `-`.
 */
function slugifyHost (host) {
  assertNonEmpty('host', host);
  // Strip trailing port (`:3000`) — port doesn't affect cross-account
  // identity. Two users on the same hostname are the same platform
  // regardless of which port their api endpoint listens on. Mirrors
  // the server-side helper in open-pryv.io components/cmc/src/slug.ts.
  const hostNoPort = host.replace(/:\d+$/, '');
  return hostNoPort.toLowerCase().replace(/\./g, '-');
}

/**
 * Build a counterparty slug `<username>--<host-slug>`.
 *
 * @param {Object} params
 * @param {string} params.username
 * @param {string} params.host - full hostname (e.g. 'pryv.me')
 * @returns {string}
 */
function counterpartySlug (params) {
  const username = assertNonEmpty('username', params.username).toLowerCase();
  assertSlugPiece('username', username);
  const hostSlug = slugifyHost(params.host);
  assertSlugPiece('host-slug', hostSlug);
  return username + SEPARATOR + hostSlug;
}

/**
 * Parse a counterparty slug back to its pieces. Note: the host-slug is
 * lossy — `pryv-me` could come from `pryv.me` or `pryv-me`. Store the
 * canonical host alongside the slug if you need it.
 *
 * @param {string} slug
 * @returns {{ username: string, hostSlug: string }}
 */
function parseCounterpartySlug (slug) {
  assertNonEmpty('slug', slug);
  const pieces = slug.split(SEPARATOR);
  if (pieces.length !== 2) {
    throw new Error(
      'cmc-slug: counterparty slug "' + slug + '" must have exactly 2 ' +
      'double-hyphen-separated pieces, got ' + pieces.length
    );
  }
  for (const piece of pieces) {
    assertSlugPiece('slug piece', piece);
  }
  return { username: pieces[0], hostSlug: pieces[1] };
}

// --- Stream-id builders ---

/** `<scopeStreamId>:chats` */
function chatsParentUnder (scopeStreamId) {
  return scopeStreamId + ':chats';
}

/** `<scopeStreamId>:chats:<counterparty-slug>` */
function chatStreamUnder (scopeStreamId, slug) {
  return scopeStreamId + ':chats:' + slug;
}

/** `<scopeStreamId>:collectors` */
function collectorsParentUnder (scopeStreamId) {
  return scopeStreamId + ':collectors';
}

/** `<scopeStreamId>:collectors:<counterparty-slug>` */
function collectorStreamUnder (scopeStreamId, slug) {
  return scopeStreamId + ':collectors:' + slug;
}

/**
 * Build the app-scope root `:_cmc:apps:<app-code>`.
 */
function appScope (appCode) {
  assertNonEmpty('appCode', appCode);
  return NS_APPS + ':' + appCode;
}

// --- Classification predicates ---

/** Does this stream-id live under the :_cmc: namespace? */
function isCmcStreamId (streamId) {
  return streamId === ':_cmc' || streamId.startsWith(NS);
}

const APP_NESTED_PLUGIN_RE = /:_cmc:apps:[^:]+(?::[^:]+)*:(chats|collectors)(?::|$)/;

/** True if this id is at or beneath chats/collectors under :_cmc:apps:*. */
function isAppNestedPluginStream (streamId) {
  return APP_NESTED_PLUGIN_RE.test(streamId);
}

/**
 * Extract the app-code segment from `:_cmc:apps:<app-code>[:...]`.
 * Returns null for ids that aren't under `:_cmc:apps:`.
 */
function getAppCode (streamId) {
  if (!streamId.startsWith(NS_APPS + ':')) return null;
  const rest = streamId.substring(NS_APPS.length + 1);
  const colonIdx = rest.indexOf(':');
  return colonIdx === -1 ? rest : rest.substring(0, colonIdx);
}

const CHAT_STREAM_ID_RE = /^(:_cmc:apps:[^:]+(?::[^:]+)*):chats:([a-z0-9-]+--[a-z0-9-]+)$/;
const COLLECTOR_STREAM_ID_RE = /^(:_cmc:apps:[^:]+(?::[^:]+)*):collectors:([a-z0-9-]+--[a-z0-9-]+)$/;

/**
 * Parse a chat trigger stream-id into its components.
 * Returns null on shape mismatch.
 */
function parseChatStreamId (streamId) {
  if (typeof streamId !== 'string') return null;
  const m = streamId.match(CHAT_STREAM_ID_RE);
  if (m == null) return null;
  let counterparty;
  try {
    counterparty = parseCounterpartySlug(m[2]);
  } catch (_e) {
    return null;
  }
  return {
    appCode: getAppCode(m[1]),
    scopeStreamId: m[1],
    counterpartySlug: m[2],
    counterparty
  };
}

/**
 * Parse a collectors trigger stream-id into its components.
 * Returns null on shape mismatch.
 */
function parseCollectorStreamId (streamId) {
  if (typeof streamId !== 'string') return null;
  const m = streamId.match(COLLECTOR_STREAM_ID_RE);
  if (m == null) return null;
  let counterparty;
  try {
    counterparty = parseCounterpartySlug(m[2]);
  } catch (_e) {
    return null;
  }
  return {
    appCode: getAppCode(m[1]),
    scopeStreamId: m[1],
    counterpartySlug: m[2],
    counterparty
  };
}

/**
 * Stable kebab-case `error.id` strings the cmc server plugin emits on
 * trigger event `content.failure.reason`. Mirror of the server's
 * `components/cmc/src/errorIds.ts` `CmcErrorIds`. Match on these
 * constants instead of parsing English `error.message`.
 */
const errorIds = Object.freeze({
  // Capability lifecycle
  CAPABILITY_INVALID: 'cmc-capability-invalid',
  CAPABILITY_CONSUMED: 'cmc-capability-consumed',
  CAPABILITY_INVALIDATED: 'cmc-capability-invalidated',
  CAPABILITY_ALREADY_ACCEPTED_BY_YOU: 'cmc-capability-already-accepted-by-you',
  CAPABILITY_TIMEOUT: 'cmc-capability-timeout',
  CAPABILITY_EMPTY: 'cmc-capability-empty',
  CAPABILITY_MULTIPLE_OFFERS: 'cmc-capability-multiple-offers',
  // Caller's numeric `request.expiresAt` resolves to a TTL outside the
  // bounds for the invite's mode: [60s, 30d] single-use, at least 60s
  // (no upper bound) open-link. Either omit `expiresAt` to use the
  // 7-day default or pick a bounded value.
  CAPABILITY_TTL_OUT_OF_RANGE: 'cmc-capability-ttl-out-of-range',
  // `expiresAt: null` (no expiry) on a single-use invite. No expiry is
  // only allowed with `mode: 'open-link'`.
  CAPABILITY_NO_EXPIRY_NOT_ALLOWED: 'cmc-capability-no-expiry-not-allowed',
  // Trigger-event content shape
  HANDLER_MISSING_CAPABILITY_URL: 'cmc-handler-missing-capability-url',
  HANDLER_MISSING_CAPABILITY_ID: 'cmc-handler-missing-capability-id',
  HANDLER_OFFER_MISSING_CAPABILITY_ID: 'cmc-handler-offer-missing-capability-id',
  OFFER_EMPTY_PERMISSIONS: 'cmc-offer-empty-permissions',
  // Handler routing
  HANDLER_WRONG_TYPE: 'cmc-handler-wrong-type',
  HANDLER_THREW: 'cmc-handler-threw',
  HANDLER_OFFER_READ_FAILED: 'cmc-handler-offer-read-failed',
  // Counterparty resolution
  HANDLER_COUNTERPARTY_UNKNOWN: 'cmc-handler-counterparty-unknown',
  // The accepting account made the offer itself (open-pryv.io 2.0.0-rc.38+).
  SELF_ACCEPT_FORBIDDEN: 'cmc-self-accept-forbidden',
  // Access mint
  HANDLER_DATA_GRANT_CREATE_FAILED: 'cmc-handler-data-grant-create-failed',
  HANDLER_DATA_GRANT_NO_APIENDPOINT: 'cmc-handler-data-grant-no-apiendpoint',
  HANDLER_BUILD_DATA_GRANT_FAILED: 'cmc-handler-build-data-grant-failed',
  BACK_CHANNEL_CREATE_FAILED: 'cmc-back-channel-create-failed',
  // Outbound delivery
  HANDLER_DELIVERY_THREW: 'cmc-handler-delivery-threw',
  HANDLER_DELIVERY_REJECTED: 'cmc-handler-delivery-rejected',
  HANDLER_DELIVERY_FAILED: 'cmc-handler-delivery-failed',
  // Chat handler outcomes
  CHAT_STREAM_NOT_CHAT: 'cmc-chat-stream-not-chat',
  CHAT_COUNTERPARTY_ACCESS_NOT_FOUND: 'cmc-chat-counterparty-access-not-found',
  CHAT_NO_REMOTE_APIENDPOINT: 'cmc-chat-no-remote-apiendpoint',
  CHAT_NO_REMOTE_CHAT_STREAM: 'cmc-chat-no-remote-chat-stream',
  // Feature-gating: a relationship with negotiated `features.chat:
  // false` or `features.systemMessaging: false` rejects sends on the
  // disabled channel. Default-permit on omission (matches the
  // offer-side default).
  CHAT_DISABLED: 'cmc-chat-disabled',
  SYSTEM_MESSAGING_DISABLED: 'cmc-system-messaging-disabled',
  // Route-level forge prevention: `accesses.create` / `accesses.update`
  // reject any user-supplied `clientData.cmc.*`. That namespace is
  // plugin-owned end-to-end (role, appCode, counterparty, capability,
  // requestEventId, features); allowing user-set values would let an
  // app forge a counterparty role and bypass the handshake.
  CLIENTDATA_CMC_FORBIDDEN: 'cmc-clientdata-cmc-forbidden',
  // streams.delete reject on the five reserved CMC parents +
  // :_cmc:_internal:* + plugin-managed chats/collectors segments —
  // even from a personal token. Deleting :_cmc: would silently break
  // every active relationship on the account.
  RESERVED_STREAM_UNDELETABLE: 'cmc-reserved-stream-undeletable',
  // The peer-side `content.from` stamping hook rejects when the
  // writer's counterparty access has no stored `{username,host}`
  // identity — wiring bug at handshake time; surface for ops.
  COUNTERPARTY_IDENTITY_MISSING: 'cmc-counterparty-identity-missing',
  // Scope-update answering a collector's request. The server resolves the
  // request as it arrived on the user's account and binds it to the
  // collector's grant; these name why an answer changed nothing.
  SCOPE_REQUEST_NOT_FOUND: 'cmc-scope-request-not-found',
  SCOPE_REQUEST_NOT_FROM_PEER: 'cmc-scope-request-not-from-peer',
  SCOPE_REQUEST_STREAM_MISMATCH: 'cmc-scope-request-stream-mismatch',
  SCOPE_REQUEST_EXPIRED: 'cmc-scope-request-expired',
  SCOPE_REQUEST_ALREADY_ANSWERED: 'cmc-scope-request-already-answered',
  SCOPE_REQUEST_INVALID: 'cmc-scope-request-invalid',
  SCOPE_UPDATE_TARGET_NOT_COUNTERPARTY: 'cmc-scope-update-target-not-counterparty',
  SCOPE_UPDATE_NOTHING_TO_APPLY: 'cmc-scope-update-nothing-to-apply',
  SCOPE_UPDATE_LOCAL_APPLY_FAILED: 'cmc-scope-update-local-apply-failed',
  // Client-side: the trigger completed but the server did not report the
  // change as applied (a server that predates applying approved requests).
  SCOPE_UPDATE_NOT_APPLIED: 'cmc-scope-update-not-applied',
  // Client-side: waiting timed out before the server recorded an outcome.
  // Not a failure; the answer may still be applied. Do not answer again.
  SCOPE_UPDATE_OUTCOME_UNKNOWN: 'cmc-scope-update-outcome-unknown',
  // Client-side: the scope request was written but not delivered within the
  // wait. `err.cause.scopeRequestEventId` names the trigger to keep watching.
  SCOPE_REQUEST_DELIVERY_PENDING: 'cmc-scope-request-delivery-pending',
  // Further server reasons (offer and grant checks, revocation, the
  // personal-token gate on triggers, protected protocol writes).
  ACCEPT_REQUIRES_PERSONAL_TOKEN: 'cmc-accept-requires-personal-token',
  CAPABILITY_OFFER_TOO_LARGE: 'cmc-capability-offer-too-large',
  GRANTED_PERMISSIONS_NOT_SUBSET: 'cmc-granted-permissions-not-subset',
  HANDLER_DATA_GRANT_NAME_CONFLICT: 'cmc-handler-data-grant-name-conflict',
  HANDLER_DELEGATION_ENDED: 'cmc-handler-delegation-ended',
  INSUFFICIENT_PERMISSIONS: 'cmc-insufficient-permissions',
  MANDATORY_PERMISSION_REFUSED: 'cmc-mandatory-permission-refused',
  OFFER_INVALID_ACCESS_TYPE: 'cmc-offer-invalid-access-type',
  OFFER_INVALID_PERMISSIONS: 'cmc-offer-invalid-permissions',
  // An offer asks a stream the server manages on the accepter's account (the
  // inbox, the internal subtree, a chats / collectors leaf, the `:_cmc:apps`
  // root), reported on the accept trigger. Not the same id as
  // OFFER_INVALID_PERMISSIONS (entries that are not valid permissions at all).
  OFFER_STREAM_NOT_OFFERABLE: 'cmc-offer-stream-not-offerable',
  // `consent/invalidate-link-cmc` written on a stream that does not hold the
  // invite it names (or the invite cannot be found).
  INVALIDATE_LINK_SCOPE_MISMATCH: 'cmc-invalidate-link-scope-mismatch',
  // An app or shared access wrote a protocol record outside the plugin's own
  // paths (answered 403 `forbidden` with this `data.id`).
  PROTECTED_EVENT_WRITE: 'cmc-protected-event-write',
  REVOKE_DELETE_FAILED: 'cmc-revoke-delete-failed',
  REVOKE_DELIVERY_FAILED: 'cmc-revoke-delivery-failed',
  REVOKE_FORBIDDEN: 'cmc-revoke-forbidden',
  REVOKE_NO_PEER_ENDPOINT: 'cmc-revoke-no-peer-endpoint',
  SCOPE_UPDATE_TARGET_STREAM_MISMATCH: 'cmc-scope-update-target-stream-mismatch',
  USER_CHOICE_NOT_ALLOWED: 'cmc-consent-user-choice-not-allowed',
  // Group membership, refused when the trigger is written (`error.data.id`).
  // The writing access is neither a membership access nor the group's
  // personal token.
  MEMBER_ACCESS_NOT_MEMBER: 'cmc-member-access-not-member',
  // No relationship with that patient under the trigger's stream.
  MEMBER_ACCESS_RELATIONSHIP_NOT_FOUND: 'cmc-member-access-relationship-not-found',
  // `scopeStreamId` is neither the trigger's stream nor under it.
  MEMBER_ACCESS_SCOPE_OUTSIDE_MEMBERSHIP: 'cmc-member-access-scope-outside-membership',
  // Permissions wider than the patient's offer (or than the patient's grant,
  // reported by the patient's core).
  MEMBER_ACCESS_PERMISSIONS_NOT_SUBSET: 'cmc-member-access-permissions-not-subset',
  // `expireAfter` outside the core's bounds (60 s to 7 days by default).
  MEMBER_ACCESS_EXPIRY_OUT_OF_RANGE: 'cmc-member-access-expiry-out-of-range',
  // Too many requests from this membership in the last minute.
  MEMBER_ACCESS_RATE_LIMITED: 'cmc-member-access-rate-limited',
  // A request for the same patient is still running: ask again shortly.
  MEMBER_ACCESS_IN_FLIGHT: 'cmc-member-access-in-flight',
  // A membership offer asked for more than team streams at `read` or
  // `contribute` (also thrown by `requestMembership` before writing).
  MEMBERSHIP_PERMISSIONS_INVALID: 'cmc-membership-permissions-invalid',
  // The patient's core refused the member stamp on the child access.
  MEMBER_STAMP_INVALID: 'cmc-member-stamp-invalid',
  // Group membership, recorded on the trigger (`content.failure.reason`).
  // The patient's grant is not delegable (offered without `accessType: 'app'`).
  MEMBER_ACCESS_GRANT_NOT_DELEGABLE: 'cmc-member-access-grant-not-delegable',
  // The patient's core refused the access (`failure.detail` holds
  // `{ peerErrorId, httpStatus }` only).
  MEMBER_ACCESS_PEER_REJECTED: 'cmc-member-access-peer-rejected',
  // The patient's core could not be reached: ask again later.
  MEMBER_ACCESS_PEER_UNREACHABLE: 'cmc-member-access-peer-unreachable',
  // The membership ended while the access was being created.
  MEMBER_ACCESS_MEMBERSHIP_GONE: 'cmc-member-access-membership-gone',
  // A member access is never created by the retry queue.
  MEMBER_ACCESS_NOT_RETRYABLE: 'cmc-member-access-not-retryable',
  // An offboarding sweep could not delete every access it minted.
  MEMBER_REVOKE_RESIDUAL: 'cmc-member-revoke-residual',
  // Chat and alerts from a member to the group are not supported.
  MEMBER_CHANNEL_NOT_SUPPORTED: 'cmc-member-channel-not-supported',
  // Client-side: the group's core answered without a member access and
  // without a failure, so it does not support member access.
  MEMBER_ACCESS_UNSUPPORTED: 'cmc-member-access-unsupported',
  // Client-side: the group's core created the access (the trigger records it)
  // but the answer reached the client without the token: ask again.
  MEMBER_ACCESS_TOKEN_MISSING: 'cmc-member-access-token-missing',
  // Client-side: `acceptMembership` was given an ordinary offer.
  MEMBERSHIP_OFFER_EXPECTED: 'cmc-membership-offer-expected'
});

// --- Level-1 protocol functions ---
//
// Each function takes a `pryv.Connection` (peer dep) as first arg.
// Server-side protocol behaviour is documented in
// open-pryv.io/components/cmc/IMPLEMENTERS-GUIDE.md.
//
// `connection.api([{method, params}])` returns the raw batch result;
// `connection.apiOne(method, params, resultKey)` unwraps `result[resultKey]`
// and throws PryvError on `.error`. Both are used below.

/**
 * Typed error wrapping a CMC trigger-event failure. `id` is the stable
 * kebab-case reason from `errorIds` (mirrors server-side CmcErrorIds);
 * `cause` is the underlying error or trigger-event object for callers
 * that want the raw payload.
 */
class CmcError extends Error {
  constructor (message, id, cause) {
    super(message);
    this.name = 'CmcError';
    this.id = id;
    if (cause !== undefined) this.cause = cause;
  }
}

/**
 * Open a CMC invite. Server-side mints capability URL + offer event.
 * Reference: IMPLEMENTERS-GUIDE §"Step 2 — Provider publishes the request".
 *
 * @param {Object} conn               pryv.Connection (provider side)
 * @param {Object} params
 * @param {string} params.appCode
 * @param {string} params.scopeStreamId          - e.g. ':_cmc:apps:my-app' or a subtree
 * @param {string} params.displayName
 * @param {Array<{streamId,level:string}>} params.requestedPermissions
 * @param {'single-use'|'open-link'} [params.mode='single-use']
 * @param {{en?:string}|Object} [params.title]
 * @param {{en?:string}|Object} [params.description]
 * @param {{en?:string}|Object} [params.consent]
 * @param {{chat?:boolean, systemMessaging?:boolean}} [params.features]
 * @param {number|null} [params.expiresAt] - Unix seconds; omit for the
 *   7-day default. The server bounds it per mode: single-use [60s, 30d],
 *   open-link at least 60s with no upper bound. `null` (open-link only)
 *   requests a link without expiry; a core that predates this mints the
 *   7-day default instead, so check the result's `expiresAt === null`.
 * @param {'shared'|'app'} [params.accessType='shared'] - Pryv access type the
 *   accepted data-grant is minted as. Default `shared` (non-delegable). Set
 *   `app` to make the grant delegable — the approved requester can then
 *   `accesses.create` scoped, individually-named sub-accesses (permissions ⊆
 *   the grant) for least-privilege re-delegation with per-actor audit.
 * @param {boolean} [params.allowUserChoice=false] - true lets the accepter
 *   grant a subset of the permissions (except `mandatory` entries).
 * @param {string|null} [params.to=null]
 * @param {Object} [params.requesterMeta]
 * @returns {Promise<{inviteEventId:string, capabilityUrl:string, mode:string, expiresAt:number|null}>}
 */
async function createInvite (conn, params) {
  if (params == null) throw new Error('createInvite: params required');
  return writeOffer(conn, params, null, 'createInvite');
}

/**
 * Write a `consent/request-cmc` offer. `extraRequest` is merged into
 * `content.request` (the membership flag).
 */
async function writeOffer (conn, params, extraRequest, fnName) {
  if (params.expiresAt === null && (params.mode || 'single-use') !== 'open-link') {
    throw new CmcError(fnName + ': expiresAt: null (no expiry) requires mode "open-link"',
      errorIds.CAPABILITY_NO_EXPIRY_NOT_ALLOWED);
  }
  const requesterMeta = Object.assign(
    { displayName: params.displayName, appId: params.appCode },
    params.requesterMeta || {}
  );
  const request = {
    title: params.title || { en: params.displayName },
    description: params.description || { en: '' },
    consent: params.consent || { en: '' },
    permissions: params.requestedPermissions || []
  };
  if (params.features) request.features = params.features;
  if (params.expiresAt !== undefined) request.expiresAt = params.expiresAt;
  if (params.accessType) request.accessType = params.accessType;
  if (typeof params.allowUserChoice === 'boolean') request.allowUserChoice = params.allowUserChoice;
  if (extraRequest != null) Object.assign(request, extraRequest);
  const content = {
    to: params.to === undefined ? null : params.to,
    capabilityRequested: true,
    request,
    requesterMeta
  };
  if (params.mode && params.mode !== 'single-use') {
    content.capability = { mode: params.mode };
  }
  const event = await conn.apiOne('events.create', {
    streamIds: [params.scopeStreamId],
    type: ET_REQUEST,
    content
  }, 'event');
  return {
    inviteEventId: event.id,
    capabilityUrl: event.content && event.content.capabilityUrl,
    mode: (event.content && event.content.capability && event.content.capability.mode) || params.mode || 'single-use',
    expiresAt: (event.content && event.content.capabilityExpiresAt) || (event.content && event.content.request && event.content.request.expiresAt)
  };
}

/**
 * List provider-side invites issued under `params.scopeStreamId` (or
 * default `:_cmc:apps`). Capped single call; default limit 1000.
 * When `truncated` is true, caller can fall back to
 * `connection.getEventsStreamed` for full iteration.
 *
 * @param {Object} conn
 * @param {Object} [params]
 * @param {string} [params.scopeStreamId=':_cmc:apps']
 * @param {number} [params.limit=1000]
 * @returns {Promise<{items:Array, truncated:boolean}>}
 */
async function listInvites (conn, params) {
  const limit = (params && params.limit) || 1000;
  const streams = [(params && params.scopeStreamId) || NS_APPS];
  const events = await conn.apiOne('events.get', {
    streams,
    types: [ET_REQUEST],
    limit
  }, 'events');
  const items = events.map(inviteRecordFromEvent);
  return { items, truncated: items.length >= limit };
}

/**
 * Normalize an arriving `consent/revoke-cmc` event into a record keyed on
 * identifiers THIS account holds.
 *
 * The event's `content.accessId` is the withdrawing side's access id on their
 * own account, so it matches nothing locally; it is surfaced here as
 * `peerAccessId` rather than `accessId`, to stop it being mistaken for
 * something to look up. The server adds the local handles, and which ones
 * depends on the side:
 *
 *   - requester (we published the invite): `backChannelAccessId` + `inviteEventId`,
 *     the same pair the accept arrival carried;
 *   - accepter (we accepted an invite): `dataGrantAccessId` + `offerEventId` +
 *     `acceptEventId`, the ids our own accept trigger was stamped with.
 *
 * `side` is `null` against a server that predates the enrichment, or for a
 * relationship too old to carry either stamp; `localAccessId` is then null too
 * and `scopeStreamId` is the identifier to match on. Nothing here throws on a
 * sparse arrival: an older peer sends only `accessId` and maybe `offerEventId`.
 *
 * The accesses named by `revokedAccessIds` are already deleted by the time this
 * event is readable. Tokens held for them are dead: drop cached endpoints
 * rather than calling `accesses.delete` yourself.
 *
 * `revokedAt` is when the withdrawing side issued the revoke (seconds; null
 * against an older peer). A notice re-sent late can land after the parties
 * accepted again: the server then records it but tears nothing down when it
 * names an earlier accept than the current one, and keeps accesses created
 * after `revokedAt`, so `revokedAccessIds` is the list to act on.
 *
 * `superseded` is set (`'relationship-re-established'`) when the receiving
 * server dropped the notice as stale: the relationship was re-established
 * since, nothing was torn down, and the arrival is informational only. Ignore
 * it and keep the endpoints you hold; `revocationMatches` answers false for it.
 * Null on a notice that was acted upon, and against an older server.
 *
 * @param {Object} event - the `consent/revoke-cmc` event as received
 * @returns {{
 *   eventId: ?string, from: ?Object, reason: ?Object, side: ?string,
 *   localAccessId: ?string, revokedAccessIds: string[], scopeStreamId: ?string,
 *   inviteEventId: ?string, offerEventId: ?string, acceptEventId: ?string,
 *   peerAccessId: ?string, revokedAt: ?number, superseded: ?string, time: ?number
 * }}
 */
function revocationFromEvent (event) {
  const c = (event && event.content) || {};
  // Same test for the label and for the id below, so a falsy-but-present value
  // cannot produce a side with no access id to go with it.
  const backChannelAccessId = c.backChannelAccessId || null;
  const dataGrantAccessId = c.dataGrantAccessId || null;
  const side = backChannelAccessId != null
    ? 'requester'
    : (dataGrantAccessId != null ? 'accepter' : null);
  return {
    eventId: (event && event.id) || null,
    // Objects or null, never a stray scalar: the declared types say object, and
    // `from` is compared field-by-field by `revocationMatches`.
    from: (c.from != null && typeof c.from === 'object') ? c.from : null,
    reason: (c.reason != null && typeof c.reason === 'object') ? c.reason : null,
    side,
    localAccessId: backChannelAccessId || dataGrantAccessId || null,
    revokedAccessIds: Array.isArray(c.revokedAccessIds) ? c.revokedAccessIds : [],
    scopeStreamId: c.scopeStreamId || null,
    inviteEventId: c.inviteEventId || null,
    offerEventId: c.offerEventId || null,
    acceptEventId: c.acceptEventId || null,
    peerAccessId: c.accessId || null,
    revokedAt: (typeof c.revokedAt === 'number' && Number.isFinite(c.revokedAt)) ? c.revokedAt : null,
    superseded: (typeof c.superseded === 'string' && c.superseded !== '') ? c.superseded : null,
    time: (event && event.time) || null
  };
}

/**
 * Does a revocation record refer to the relationship the caller is holding?
 *
 * **The most specific identifier the two sides share decides, and nothing
 * falls through past it.** The tiers, narrowest first:
 *
 *   1. `accessId` — compared against `localAccessId` and `revokedAccessIds`;
 *   2. `acceptEventId`; 3. `offerEventId`; 4. `inviteEventId`;
 *   5. `scopeStreamId`.
 *
 * Falling through used to be the bug: on an **open (multi-use) invite link**
 * every accepter's relationship carries the SAME `inviteEventId` and the SAME
 * `scopeStreamId`, because those name the link rather than the subject. So a
 * revocation by one subject matched every other subject of the same study, and
 * a caller acting on the match tore down the wrong relationship. A narrower
 * identifier that disagrees now returns false instead of letting a broader one
 * rescue the match. The cost is that an `accessId` the caller no longer holds
 * (the server already deleted it and did not list it) answers false rather than
 * matching on scope; pass the ids you hold, not the ids you held.
 *
 * `relationship.from` (`{username, host}`) acts as a FILTER, not a match: a
 * mismatch returns false before any tier is considered, and agreement alone
 * never proves a match. It is the discriminator to add on an open link, and it
 * is safe to trust because the server stamps `from` on every inbox arrival.
 *
 * A `relationship` sharing no identifier with the record returns false.
 *
 * A superseded record (`record.superseded` set: the receiving server dropped a
 * late notice because the relationship was re-established since) returns false
 * for every relationship: it ends nothing, so there is nothing to act on.
 *
 * @param {Object} record - from `revocationFromEvent`
 * @param {Object} relationship - any subset of `{accessId, acceptEventId,
 *   offerEventId, inviteEventId, scopeStreamId}`, plus an optional
 *   `from: {username, host}` filter
 * @returns {boolean}
 */
function revocationMatches (record, relationship) {
  if (record == null || relationship == null) return false;
  // A stale notice the receiving server dropped ends nothing. Also read from
  // `content` so a raw event passed in by mistake is ignored the same way.
  const superseded = record.superseded != null ? record.superseded : record.content?.superseded;
  if (typeof superseded === 'string' && superseded !== '') return false;
  const r = relationship;

  // Filter first: a different peer is never this relationship, whatever ids
  // the two happen to share through a shared link.
  if (r.from != null) {
    const f = record.from;
    if (f == null || typeof f !== 'object') return false;
    if (f.username !== r.from.username || f.host !== r.from.host) return false;
  }

  // Tolerate a hand-built record, or a raw event passed in by mistake.
  const revoked = Array.isArray(record.revokedAccessIds) ? record.revokedAccessIds : [];
  if (r.accessId != null && (record.localAccessId != null || revoked.length > 0)) {
    return record.localAccessId === r.accessId || revoked.indexOf(r.accessId) !== -1;
  }
  if (r.acceptEventId != null && record.acceptEventId != null) {
    return record.acceptEventId === r.acceptEventId;
  }
  if (r.offerEventId != null && record.offerEventId != null) {
    return record.offerEventId === r.offerEventId;
  }
  if (r.inviteEventId != null && record.inviteEventId != null) {
    return record.inviteEventId === r.inviteEventId;
  }
  if (r.scopeStreamId != null && record.scopeStreamId != null) {
    return record.scopeStreamId === r.scopeStreamId;
  }
  return false;
}

function inviteRecordFromEvent (event) {
  const c = (event && event.content) || {};
  const expiresAt = c.capabilityExpiresAt || (c.request && c.request.expiresAt) || null;
  let status = c.status || 'pending';
  // The server never stamps 'expired': derive it (client clock) for an
  // invite still waiting. An invite without expiry never expires.
  if ((status === 'pending' || status === 'delivered') && typeof expiresAt === 'number' &&
      expiresAt <= Math.floor(Date.now() / 1000)) {
    status = 'expired';
  }
  return {
    inviteEventId: event.id,
    capabilityUrl: c.capabilityUrl || null,
    mode: (c.capability && c.capability.mode) || 'single-use',
    status,
    expiresAt,
    // Single-use invites: who accepted (or refused). Open-link invites record
    // no single counterparty: see listInviteAccepters.
    counterparty: c.acceptedBy || c.refusedBy || null,
    acceptedAt: c.acceptedAt || null,
    backChannelAccessId: c.backChannelAccessId || null,
    scopeStreamId: (event.streamIds && event.streamIds[0]) || event.streamId
  };
}

/**
 * Fetch one invite's record by trigger-event id.
 *
 * @param {Object} conn
 * @param {string} inviteEventId
 * @returns {Promise<Object>}
 */
async function getInviteStatus (conn, inviteEventId) {
  const result = await conn.apiOne('events.getOne', { id: inviteEventId }, 'event');
  return inviteRecordFromEvent(result);
}

/**
 * List who has joined an invite and is still joined (provider side): the
 * back-channel accesses carrying the invite's `capabilityId`. Works for both
 * modes (0 or 1 item for single-use). A revoked relationship is gone from the
 * list. Needs a connection allowed to list accesses (personal token).
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.inviteEventId
 * @returns {Promise<{items: Array<{username:string, host:string, acceptedAt:number|null, backChannelAccessId:string, scopeStreamId:string|null}>}>}
 */
async function listInviteAccepters (conn, params) {
  if (params == null || !params.inviteEventId) {
    throw new Error('listInviteAccepters: params.inviteEventId required');
  }
  const trigger = await conn.apiOne('events.getOne', { id: params.inviteEventId }, 'event');
  const capabilityId = trigger && trigger.content && trigger.content.capabilityId;
  if (!capabilityId) {
    throw new Error('listInviteAccepters: could not locate capabilityId on invite event ' + params.inviteEventId);
  }
  const accesses = await conn.apiOne('accesses.get', {}, 'accesses');
  const items = (accesses || [])
    .filter(function (a) {
      const cmc = a && a.clientData && a.clientData.cmc;
      return cmc != null && cmc.role === 'counterparty' && cmc.capabilityId === capabilityId;
    })
    .map(function (a) {
      const cmc = a.clientData.cmc;
      const cp = cmc.counterparty || {};
      return {
        username: cp.username,
        host: cp.host,
        acceptedAt: a.created != null ? a.created : null,
        backChannelAccessId: a.id,
        scopeStreamId: cmc.scopeStreamId || null
      };
    });
  return { items };
}

/**
 * Revoke a relationship (provider side — back-channel access). Posts a
 * `consent/revoke-cmc` event with `{ accessId, reason }`; plugin
 * orchestrates dual delete.
 *
 * Two ways to identify the relationship:
 *   1. `{ accessId, scopeStreamId, reason? }` — power-user path, pass
 *      the back-channel access id directly.
 *   2. `{ inviteEventId, scopeStreamId?, reason? }` — convenience path.
 *      Reads the invite event + matching inbox accept to derive
 *      `backChannelAccessId`. Two extra API calls. Defaults
 *      `scopeStreamId` to the invite event's own stream.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} [params.accessId]              - back-channel access id (provider side)
 * @param {string} [params.inviteEventId]         - alternative to accessId
 * @param {string} [params.scopeStreamId]         - own scope to write into (required with accessId; auto-derived with inviteEventId)
 * @param {Object} [params.reason]
 * @returns {Promise<void>}
 */
async function revokeRelationship (conn, params) {
  if (params == null) throw new Error('revokeRelationship: params required');
  let accessId = params.accessId;
  let scopeStreamId = params.scopeStreamId;
  if (!accessId) {
    if (!params.inviteEventId) {
      throw new Error('revokeRelationship: provide accessId, or inviteEventId for lookup');
    }
    const inviteEvent = await conn.apiOne('events.getOne', { id: params.inviteEventId }, 'event');
    if (!inviteEvent) {
      throw new Error('revokeRelationship: invite event not found: ' + params.inviteEventId);
    }
    if (!scopeStreamId) {
      scopeStreamId = (inviteEvent.streamIds && inviteEvent.streamIds[0]) || inviteEvent.streamId;
    }
    const acceptsRaw = await conn.apiOne('events.get', {
      streams: [NS_INBOX],
      types: [ET_ACCEPT],
      limit: 200
    }, 'events');
    const match = (acceptsRaw || []).find(function (e) {
      const c = e.content || {};
      return c.originalEventId === params.inviteEventId ||
             c.requestEventId === params.inviteEventId ||
             c.inviteEventId === params.inviteEventId;
    });
    if (!match) {
      throw new Error('revokeRelationship: no inbox accept found for invite ' + params.inviteEventId);
    }
    accessId = match.content && match.content.backChannelAccessId;
    if (!accessId) {
      throw new Error('revokeRelationship: inbox accept ' + match.id + ' has no backChannelAccessId');
    }
  }
  if (!scopeStreamId) {
    throw new Error('revokeRelationship: scopeStreamId is required with accessId path');
  }
  const content = { accessId };
  if (params.reason) content.reason = params.reason;
  await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_REVOKE,
    content
  }, 'event');
}

/**
 * Withdraw an invite's capability so it stops accepting NEW patients: an
 * open-link invite, or a single-use invite nobody accepted yet (open-pryv.io
 * 2.0.0-rc.56 and later; the invite's status becomes `invalidated` and a
 * later accept fails with `cmc-capability-invalidated`). The provided
 * `inviteEventId` is used to look up the trigger event and read its
 * `capabilityId`. Already-established relationships are untouched (use
 * `revokeRelationship`). Idempotent; a no-op on a single-use invite already
 * accepted, and on any single-use invite with an earlier core.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.inviteEventId
 * @param {string} [params.scopeStreamId]   - own scope to write the invalidate into (defaults to the trigger's stream)
 * @param {Object} [params.reason]
 * @returns {Promise<void>}
 */
async function invalidateCapability (conn, params) {
  if (params == null || !params.inviteEventId) {
    throw new Error('invalidateCapability: params.inviteEventId required');
  }
  const trigger = await conn.apiOne('events.getOne', { id: params.inviteEventId }, 'event');
  const capabilityId = trigger && trigger.content && (trigger.content.capabilityId ||
    (trigger.content.capability && trigger.content.capability.id));
  if (!capabilityId) {
    throw new Error('invalidateCapability: could not locate capabilityId on invite event ' + params.inviteEventId);
  }
  const scopeStreamId = params.scopeStreamId ||
    (trigger.streamIds && trigger.streamIds[0]) || trigger.streamId;
  const content = { capabilityId };
  if (params.reason) content.reason = params.reason;
  await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_INVALIDATE_LINK,
    content
  }, 'event');
}

/**
 * Provider proposes a scope change to a user (collector side). Posts a
 * `consent/scope-request-cmc` on the collector stream.
 *
 * Renamed from `requestScopeUpdate` in 3.9.0 to free that name for the
 * user-side accept hand-off helper. The old name is kept as a
 * deprecated alias (see module.exports below); remove after one
 * release cycle.
 *
 * By default waits until the request is delivered to the user and returns
 * `remoteScopeRequestEventId`: the id the request has on the USER's account.
 * That is the id the user side answers (`acceptScopeUpdate`, and the
 * `scopeRequestEventId` of a `/cmc-scope-update` hand-off). The returned
 * `scopeRequestEventId` is the collector-side trigger and cannot be answered.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.collectorStreamId       - the provider's own collector stream
 * @param {Array<{streamId,level:string}>} params.newPermissions
 * @param {Object} [params.message]
 * @param {number} [params.expires]
 * @param {boolean} [params.waitForDelivery=true]
 * @param {number}  [params.deliveryTimeoutMs=20000] - must exceed the core outbound delivery timeout (15 s by default)
 * @param {number}  [params.deliveryPollIntervalMs=200]
 * @returns {Promise<{scopeRequestEventId:string, remoteScopeRequestEventId:string|null, status:string}>}
 */
async function proposeScopeUpdate (conn, params) {
  if (params == null) throw new Error('proposeScopeUpdate: params required');
  const content = { newPermissions: params.newPermissions };
  if (params.message) content.message = params.message;
  if (params.expires) content.expires = params.expires;
  const event = await conn.apiOne('events.create', {
    streamIds: [params.collectorStreamId],
    type: ET_SCOPE_REQUEST,
    content
  }, 'event');
  if (params.waitForDelivery === false) {
    return { scopeRequestEventId: event.id, remoteScopeRequestEventId: null, status: 'pending' };
  }
  let finalEvent;
  try {
    finalEvent = await pollTriggerCompletion(conn, event.id, {
      timeoutMs: params.deliveryTimeoutMs || SCOPE_WAIT_DEFAULT_MS,
      intervalMs: params.deliveryPollIntervalMs || 200
    });
  } catch (err) {
    if (!(err instanceof CmcError) || err.id !== errorIds.CAPABILITY_TIMEOUT) throw err;
    // The request exists and may still be delivered: hand back its id so the
    // caller can keep watching its own trigger for `remoteEventId`.
    throw new CmcError('CMC scope request not delivered yet', errorIds.SCOPE_REQUEST_DELIVERY_PENDING,
      { scopeRequestEventId: event.id });
  }
  const fc = finalEvent.content || {};
  if (fc.status === 'failed') {
    const reason = (fc.failure && fc.failure.reason) || errorIds.HANDLER_THREW;
    throw new CmcError('CMC scope request failed: ' + reason, reason, fc.failure);
  }
  return {
    scopeRequestEventId: event.id,
    remoteScopeRequestEventId: fc.remoteEventId || null,
    status: fc.status
  };
}

// --- Consumer side ---

/**
 * Read a capability URL. Opens the capability access as a Pryv
 * connection and reads the offer event (one event under
 * `:_cmc:_internal:offer`).
 *
 * No auto-retry — errors surface directly. Matches lib-js convention
 * (Connection.api doesn't auto-retry). Caller picks retry policy.
 *
 * @param {string} capabilityUrl
 * @param {Object} [opts]
 * @param {Object} [opts.pryv]   - explicit pryv module (otherwise resolved via require('pryv'))
 * @returns {Promise<{requester:{username:string|null,host:string,displayName?:string}, capabilityState:string|null, consent:Object|undefined, requestedPermissions:Array, allowUserChoice:boolean, accessType:'shared'|'app', membership:boolean, mode:string, features:Object}>}
 *   `capabilityState` is `'open'`, `'consumed'` (a single-use link already
 *   accepted) or `'invalidated'` (withdrawn by the requester); null when it
 *   could not be read.
 */
async function readOffer (capabilityUrl, opts) {
  const pryv = (opts && opts.pryv) || require('pryv');
  const cap = new pryv.Connection(capabilityUrl);
  // The capability access has `read` on a single per-capability stream
  // (`:_cmc:_internal:offer:<capId>`) but the accepter doesn't know
  // <capId> from the capabilityUrl alone. The parent `:_cmc:_internal:offer`
  // is NOT a reserved stream that auto-exists on every user account — only
  // the per-capability children do — so a `streams: [':_cmc:_internal:offer']`
  // filter resolves to `unknown-referenced-resource`.
  //
  // Mirror the plugin's own readOfferViaCapability (acceptOrchestration.ts):
  // omit the streams filter entirely and rely on the cap access's
  // permissions to narrow the response to the single offer event this
  // token can read. The `types` filter is defensive in case the offer
  // stream ever holds more than one event in future revisions.
  const events = await cap.apiOne('events.get', {
    types: [ET_REQUEST],
    limit: 1
  }, 'events');
  if (events.length === 0) {
    throw new CmcError('CMC capability offer stream empty', errorIds.CAPABILITY_EMPTY);
  }
  if (events.length > 1) {
    throw new CmcError('CMC capability offer stream had multiple events', errorIds.CAPABILITY_MULTIPLE_OFFERS);
  }
  const offer = events[0];
  const content = (offer && offer.content) || {};
  const request = content.request || {};
  const meta = content.requesterMeta || {};
  let requesterIdentity = { username: null, host: '', displayName: meta.displayName };
  // The capability access lives on the requester's platform: the username
  // on it is the requester's, and its clientData carries the capability
  // state ('open', 'consumed' once a single-use link was accepted,
  // 'invalidated' once the requester withdrew it).
  let accessInfo = null;
  try {
    accessInfo = await cap.accessInfo();
  } catch (_e) {
    // Best-effort; offer content still returned.
  }
  try {
    const info = await cap.service.info();
    const decomposed = pryv.utils.decomposeAPIEndpoint(capabilityUrl, info.api);
    requesterIdentity = {
      username: (accessInfo && accessInfo.user && accessInfo.user.username) || decomposed.username,
      host: decomposed.host,
      displayName: meta.displayName
    };
  } catch (_e) {
    // Best-effort identity; offer content still returned.
  }
  const capabilityState = accessInfo?.clientData?.cmc?.capability?.state;
  const membership = request.membership === true;
  return {
    requester: requesterIdentity,
    // null when the state could not be read (access-info failed).
    capabilityState: typeof capabilityState === 'string' ? capabilityState : null,
    consent: request.consent,
    requestedPermissions: request.permissions || [],
    // The server treats a membership offer as allowing a subset whatever it says.
    allowUserChoice: membership || request.allowUserChoice === true,
    // 'app': the grant is delegable (the requester may create sub-accesses
    // from it); consent screens should say so.
    accessType: request.accessType === 'app' ? 'app' : 'shared',
    // true: the requester asks to join the accepter's group.
    membership,
    mode: (content.capability && content.capability.mode) || 'single-use',
    features: request.features || {}
  };
}

/**
 * Accept an offer. Mints the data-grant + back-channel locally; the
 * server's plugin handles the back-channel delivery to the requester
 * (~50-200ms async; trigger event status goes 'pending' → 'completed'
 * once back-channel populates counterparty.apiEndpoint).
 *
 * **Requires a PERSONAL access token on `conn`.** Server-side
 * `consent/accept-cmc` writes from app- or shared-access tokens are
 * rejected `400 invalid-operation` (`error.data.id ===
 * 'cmc-accept-requires-personal-token'`). Apps that hold only an
 * app/shared token should call `requestAccept` instead — it hands off
 * to app-web-user-account's `/cmc-accept` page where the user signs in, the
 * trigger is written with the fresh personal token, and the data-grant
 * apiEndpoint is returned to the caller.
 *
 * By default resolves only after Phase 2 (trigger status='completed').
 * Throws CmcError carrying tagged failure.reason as error.id on 'failed'.
 * When the offer read shows the link already accepted (single-use) or
 * withdrawn, throws `cmc-capability-consumed` / `cmc-capability-invalidated`
 * before writing anything, so no failed trigger is left in the account.
 *
 * Power users: opt out with { waitForCompletion: false } → resolves
 * immediately after events.create with { acceptEventId,
 * dataGrantAccessId, status: 'pending' } and observes completion
 * themselves.
 *
 * @param {Object} conn                     accepter's connection (personal access token).
 * @param {string} capabilityUrl
 * @param {Object} opts
 * @param {string} opts.scopeStreamId       - REQUIRED. Own :_cmc:apps:<app>[:...] stream where the accept trigger lands. Must NOT be :_cmc:inbox (which routes through the peer-delivered path).
 * @param {{chat?:boolean,systemMessaging?:boolean}} [opts.extra]
 * @param {string} [opts.accessName]
 * @param {Array<{streamId:string, level:string}>} [opts.grantedPermissions] - grant only
 *   this subset of the offer (the offer must allow user choice; `mandatory` entries
 *   cannot be left out). Omit to grant the whole offer.
 * @param {boolean} [opts.waitForCompletion=true]
 * @param {number}  [opts.completionTimeoutMs=10000]
 * @param {number}  [opts.completionPollIntervalMs=200]
 * @returns {Promise<Object>}
 */
async function acceptInvite (conn, capabilityUrl, opts) {
  opts = opts || {};
  requireAcceptScope(opts, 'acceptInvite');
  // Read the offer FIRST to capture counterparty identity (single-use
  // capabilities flip to 'consumed' on the first accept, so a second
  // read after submit would fail) and the capability state: a consumed
  // or invalidated link throws before any trigger is written.
  let offer = null;
  try {
    offer = await readOffer(capabilityUrl, opts);
  } catch (_e) {
    // Best-effort; if offer read fails the accept can still proceed.
  }
  return acceptOffer(conn, capabilityUrl, opts, offer);
}

function requireAcceptScope (opts, fnName) {
  if (!opts.scopeStreamId) {
    throw new Error(fnName + ': opts.scopeStreamId is required ' +
      '(an :_cmc:apps:<app>[:...] stream on YOUR account where the accept ' +
      'trigger lands — not :_cmc:inbox, which routes through the peer-delivered path)');
  }
}

/**
 * Write the accept trigger for an offer already read (or null when the
 * read failed), then wait for completion unless told not to.
 */
async function acceptOffer (conn, capabilityUrl, opts, offer) {
  // A link already accepted (single-use) or withdrawn is refused by the
  // server anyway; refusing it here leaves no failed trigger behind. The
  // server stays the authority: an unknown state proceeds.
  const capabilityState = offer?.capabilityState;
  if (capabilityState === 'consumed') {
    throw new CmcError('CMC accept refused: the capability was already accepted', errorIds.CAPABILITY_CONSUMED);
  }
  if (capabilityState === 'invalidated') {
    throw new CmcError('CMC accept refused: the capability was withdrawn by the requester', errorIds.CAPABILITY_INVALIDATED);
  }
  const scopeStreamId = opts.scopeStreamId;
  let counterparty = { username: null, host: null, displayName: undefined };
  let offerFeatures = null;
  if (offer != null) {
    counterparty = {
      username: offer.requester && offer.requester.username,
      host: offer.requester && offer.requester.host,
      displayName: offer.requester && offer.requester.displayName
    };
    offerFeatures = offer.features || null;
  }
  // Persist the negotiated features into the accept trigger so the
  // plugin's handleAccept can stamp them onto the data-grant access's
  // clientData.cmc.features. Both keys default to true when omitted on
  // the offer side (per README "Features negotiation"); explicit false
  // is binding both ways.
  const resolvedFeatures = {
    chat: offerFeatures?.chat !== false,
    systemMessaging: offerFeatures?.systemMessaging !== false
  };
  const content = { capabilityUrl, features: resolvedFeatures };
  if (opts.extra) content.extra = opts.extra;
  if (opts.accessName) content.accessName = opts.accessName;
  if (opts.grantedPermissions != null) content.grantedPermissions = opts.grantedPermissions;
  const event = await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_ACCEPT,
    content
  }, 'event');
  const waitForCompletion = opts.waitForCompletion !== false;
  if (!waitForCompletion) {
    return {
      acceptEventId: event.id,
      dataGrantAccessId: (event.content && event.content.dataGrantAccessId) || null,
      counterparty,
      features: offerFeatures || {},
      status: (event.content && event.content.status) || 'pending'
    };
  }
  const finalEvent = await pollTriggerCompletion(conn, event.id, {
    timeoutMs: opts.completionTimeoutMs || 10000,
    intervalMs: opts.completionPollIntervalMs || 200
  });
  const fc = finalEvent.content || {};
  if (fc.status === 'failed') {
    const reason = (fc.failure && fc.failure.reason) || 'cmc-handler-threw';
    throw new CmcError('CMC accept failed: ' + reason, reason, fc.failure);
  }
  return {
    acceptEventId: finalEvent.id,
    dataGrantAccessId: fc.dataGrantAccessId || null,
    counterparty,
    features: offerFeatures || fc.features || (fc.request && fc.request.features) || {}
  };
}

/**
 * Requester-side dual of `acceptInvite`'s Phase 2 wait: poll for the
 * accepter's `consent/accept-cmc` arrival on `:_cmc:inbox`. Returns the
 * data the requester needs to actually USE the access — the data-grant
 * apiEndpoint on the accepter's account and the accepter's identity.
 *
 * The inbox arrival does NOT carry the requester's inviteEventId (the
 * server-side `originalEventId` field is the capability-internal offer
 * event id, not the trigger). Identification therefore relies on
 * `from.{username,host}` + `requesterAppCode` matching. Pass either or
 * both as options:
 *   - { fromUsername, fromHost? }     match on incoming `from.username`
 *                                     (and host if provided).
 *   - { appCode }                     also match `requesterAppCode`.
 *   - { sinceTime } (optional)        skip arrivals older than this
 *                                     unix-seconds timestamp.
 *
 * If multiple arrivals match, the most-recent one wins.
 *
 * @param {Object} conn
 * @param {Object} opts
 * @param {string} [opts.fromUsername]
 * @param {string} [opts.fromHost]
 * @param {string} [opts.appCode]
 * @param {number} [opts.sinceTime]
 * @param {number} [opts.timeoutMs=15000]
 * @param {number} [opts.intervalMs=300]
 * @returns {Promise<{acceptInboxEventId:string, grantedAccessApiEndpoint:string|null, counterparty:{username:string,host:string}|null, features:Object}>}
 */
async function waitForAccept (conn, opts) {
  opts = opts || {};
  if (!opts.fromUsername && !opts.appCode) {
    throw new Error('waitForAccept: provide at least one of opts.fromUsername / opts.appCode to identify the arrival');
  }
  return pollInboxAccept(conn, opts, null);
}

/**
 * Poll `:_cmc:inbox` for the most recent accept arrival matching `opts`
 * and, when given, `extraMatch(content)`.
 */
async function pollInboxAccept (conn, opts, extraMatch) {
  const timeoutMs = opts.timeoutMs || 15000;
  const intervalMs = opts.intervalMs || 300;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const events = await conn.apiOne('events.get', {
      streams: [NS_INBOX],
      types: [ET_ACCEPT],
      limit: 100,
      sortAscending: false
    }, 'events');
    for (const ev of (events || [])) {
      const c = ev.content || {};
      if (opts.sinceTime != null && ev.time != null && ev.time < opts.sinceTime) continue;
      if (opts.fromUsername != null && (c.from == null || c.from.username !== opts.fromUsername)) continue;
      if (opts.fromHost != null && (c.from == null || c.from.host !== opts.fromHost)) continue;
      if (opts.appCode != null && c.requesterAppCode !== opts.appCode) continue;
      if (extraMatch != null && !extraMatch(c)) continue;
      return {
        acceptInboxEventId: ev.id,
        grantedAccessApiEndpoint: (c.grantedAccess && c.grantedAccess.apiEndpoint) || null,
        counterparty: c.from || null,
        features: c.features || {}
      };
    }
    await sleep(intervalMs);
  }
  throw new CmcError(
    'waitForAccept: no consent/accept-cmc arrival matching ' + JSON.stringify({ fromUsername: opts.fromUsername, fromHost: opts.fromHost, appCode: opts.appCode }) + ' within ' + timeoutMs + 'ms',
    errorIds.CAPABILITY_TIMEOUT
  );
}

async function pollTriggerCompletion (conn, eventId, opts) {
  const deadline = Date.now() + opts.timeoutMs;
  // Initial check before sleeping.
  for (;;) {
    const ev = await conn.apiOne('events.getOne', { id: eventId }, 'event');
    const status = ev && ev.content && ev.content.status;
    if (status === 'completed' || status === 'failed') return ev;
    if (Date.now() >= deadline) {
      throw new CmcError(
        'CMC trigger ' + eventId + ' did not reach completed/failed within ' + opts.timeoutMs + 'ms (last status: ' + status + ')',
        errorIds.CAPABILITY_TIMEOUT
      );
    }
    await sleep(opts.intervalMs);
  }
}

function sleep (ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

/**
 * Refuse an offer. Single event write; plugin delivers refusal back via
 * capability. No accesses created.
 *
 * @param {Object} conn
 * @param {string} capabilityUrl
 * @param {Object} opts
 * @param {string} opts.scopeStreamId       - REQUIRED. Own :_cmc:apps:<app>[:...] stream where the refuse trigger lands.
 * @param {Object} [opts.reason]
 * @returns {Promise<{refuseEventId:string}>}
 */
async function refuseInvite (conn, capabilityUrl, opts) {
  opts = opts || {};
  if (!opts.scopeStreamId) {
    throw new Error('refuseInvite: opts.scopeStreamId is required ' +
      '(an :_cmc:apps:<app>[:...] stream on YOUR account where the refuse trigger lands)');
  }
  const scopeStreamId = opts.scopeStreamId;
  const content = { capabilityUrl };
  if (opts.reason) content.reason = opts.reason;
  const event = await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_REFUSE,
    content
  }, 'event');
  return { refuseEventId: event.id };
}

/**
 * Revoke an established relationship from the accepter (data-grant) side.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.scopeStreamId   - own scope to write into
 * @param {string} params.accessId        - the local data-grant access id
 * @param {Object} [params.reason]
 * @returns {Promise<void>}
 */
async function revokeAcceptance (conn, params) {
  if (params == null) throw new Error('revokeAcceptance: params required');
  const content = { accessId: params.accessId };
  if (params.reason) content.reason = params.reason;
  await conn.apiOne('events.create', {
    streamIds: [params.scopeStreamId],
    type: ET_REVOKE,
    content
  }, 'event');
}

/**
 * List accepted relationships from the accepter side. Reads
 * `consent/accept-cmc` triggers under the given scope.
 *
 * A relationship that has ended carries `content.withdrawal` on its accept
 * event (stamped by the server, whatever ended it: deleting the data grant,
 * a revoke by either side, a delegation detach). Those are left out unless
 * `params.includeWithdrawn` is true. A core that does not record withdrawals
 * leaves ended relationships looking active. Failed accept triggers (the
 * server refused the accept, so no relationship exists) are always left out.
 *
 * @param {Object} conn
 * @param {Object} [params]
 * @param {string} [params.scopeStreamId=':_cmc:apps']  - root or sub-scope to search recursively
 * @param {number} [params.limit=1000] - most relationships returned; events left out do not count
 *   (further pages of `limit` events are read until it is reached or the events run out)
 * @param {boolean} [params.includeWithdrawn=false] - also list ended relationships
 * @returns {Promise<Array>}
 */
async function listAcceptedRelationships (conn, params) {
  params = params || {};
  // Default to the apps root (recursive) so callers get every relationship
  // across all of their app scopes. Pass `params.scopeStreamId` for a narrower
  // view (e.g. a single app or sub-scope).
  const streams = [params.scopeStreamId || NS_APPS];
  const limit = params.limit || 1000;
  const includeWithdrawn = params.includeWithdrawn === true;
  function isListed (event) {
    const c = event?.content;
    // A failed trigger (e.g. a re-opened link the server refused) never
    // made a relationship.
    if (c?.status === 'failed') return false;
    return includeWithdrawn || c?.withdrawal == null;
  }
  // The filter is local, so read page after page until `limit` records are
  // kept or the events run out: left-out events must not crowd out real
  // relationships.
  const listed = [];
  let skip = 0;
  for (;;) {
    const query = { streams, types: [ET_ACCEPT], limit };
    if (skip > 0) query.skip = skip;
    const events = (await conn.apiOne('events.get', query, 'events')) || [];
    for (const event of events) {
      if (listed.length >= limit) break;
      if (isListed(event)) listed.push(event);
    }
    if (listed.length >= limit || events.length < limit) break;
    skip += events.length;
  }
  return listed.map(function (event) {
    const c = (event && event.content) || {};
    return {
      acceptEventId: event.id,
      counterparty: c.from || c.acceptedBy || null,
      dataGrantAccessId: c.dataGrantAccessId || null,
      backChannelAccessId: c.backChannelAccessId || null,
      appCode: c.appCode || null,
      scopeStreamId: (event.streamIds && event.streamIds[0]) || event.streamId,
      acceptedAt: c.acceptedAt || event.time || null,
      // Features default to true on both keys when absent (per README
      // "Features negotiation"). The legacy c.extra fallback predates
      // the contract fix and is no longer reachable for events written
      // by pryv-cmc >= 1.1.1; we leave the field-omission default at
      // true to honour the documented contract.
      features: c.features || { chat: true, systemMessaging: true },
      // Set when the relationship has ended (see above); null while active.
      withdrawal: c.withdrawal || null
    };
  });
}

// --- Cross-direction (chat, system, scope-update) ---

/**
 * Send a chat message. Posts `message/chat-cmc` to
 * `<scopeStreamId>:chats:<peerSlug>`.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.scopeStreamId
 * @param {string} params.peerSlug
 * @param {string} params.content    1-10240 chars per data-types/message.json#chat-cmc schema
 * @returns {Promise<{chatEventId:string}>}
 */
async function sendChat (conn, params) {
  if (params == null) throw new Error('sendChat: params required');
  const streamId = chatStreamUnder(params.scopeStreamId, params.peerSlug);
  const event = await conn.apiOne('events.create', {
    streamIds: [streamId],
    type: ET_CHAT,
    content: { content: params.content }
  }, 'event');
  return { chatEventId: event.id };
}

/**
 * Send a system alert. Posts `notification/alert-cmc` to
 * `<scopeStreamId>:collectors:<peerSlug>`.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.scopeStreamId
 * @param {string} params.peerSlug
 * @param {'info'|'warning'|'critical'} [params.level='info']
 * @param {Object} params.title
 * @param {Object} params.body
 * @param {boolean} [params.ackRequired]
 * @param {string} [params.ackId]
 * @returns {Promise<{alertEventId:string}>}
 */
async function sendSystemAlert (conn, params) {
  if (params == null) throw new Error('sendSystemAlert: params required');
  const streamId = collectorStreamUnder(params.scopeStreamId, params.peerSlug);
  const content = {
    level: params.level || 'info',
    title: params.title,
    body: params.body
  };
  if (params.ackRequired !== undefined) content.ackRequired = params.ackRequired;
  if (params.ackId) content.ackId = params.ackId;
  const event = await conn.apiOne('events.create', {
    streamIds: [streamId],
    type: ET_SYSTEM_ALERT,
    content
  }, 'event');
  return { alertEventId: event.id };
}

/**
 * Send an ack for a received alert. Posts `notification/ack-cmc` with
 * `{ alertEventId, ackId, ... }`.
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.scopeStreamId
 * @param {string} params.peerSlug
 * @param {string} params.alertEventId
 * @param {string} params.ackId
 * @returns {Promise<{ackEventId:string}>}
 */
async function sendSystemAck (conn, params) {
  if (params == null) throw new Error('sendSystemAck: params required');
  const streamId = collectorStreamUnder(params.scopeStreamId, params.peerSlug);
  const content = {
    alertEventId: params.alertEventId,
    ackId: params.ackId
  };
  const event = await conn.apiOne('events.create', {
    streamIds: [streamId],
    type: ET_SYSTEM_ACK,
    content
  }, 'event');
  return { ackEventId: event.id };
}

/**
 * Accept a scope-update proposal. Posts `consent/scope-update-cmc` with
 * `{ scopeRequestEventId, accept: true }`; the server applies the request's
 * permission set to the collector's data-grant.
 *
 * `scopeRequestEventId` is the id of the request ON THIS ACCOUNT (the
 * collector's `proposeScopeUpdate` returns it as `remoteScopeRequestEventId`).
 *
 * By default waits for the outcome and resolves only once the grant changed:
 * `{ updateAcceptEventId, dataGrantAccessId, newPermissions, status,
 * peerNotified, deliveryFailure? }`. `peerNotified: false` means the grant
 * changed but the collector could not be told yet. Throws `CmcError` when
 * nothing was applied (`err.id` is the server's reason, or
 * `cmc-scope-update-not-applied` against a server that does not apply
 * approved requests). `waitForCompletion: false` returns right after the
 * write as `{ updateAcceptEventId, status: 'pending' }`.
 *
 * @param {Object} conn
 * @param {string} scopeRequestEventId
 * @param {Object} [opts]
 * @param {string} [opts.scopeStreamId]   - own collector stream (defaults to the request's stream)
 * @param {boolean} [opts.waitForCompletion=true]
 * @param {number}  [opts.completionTimeoutMs=20000] - must exceed the core outbound delivery timeout (15 s by default)
 * @param {number}  [opts.completionPollIntervalMs=200]
 * @returns {Promise<Object>}
 */
async function acceptScopeUpdate (conn, scopeRequestEventId, opts) {
  opts = opts || {};
  const scopeStreamId = opts.scopeStreamId || await resolveScopeRequestStream(conn, scopeRequestEventId);
  const event = await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_SCOPE_UPDATE,
    content: { scopeRequestEventId, accept: true }
  }, 'event');
  if (opts.waitForCompletion === false) {
    return { updateAcceptEventId: event.id, status: 'pending' };
  }
  const fc = await waitScopeUpdate(conn, event.id, opts);
  if (fc.applied !== true) {
    if (fc.status === 'failed') throw scopeUpdateFailure(fc);
    throw new CmcError('CMC scope update completed without being applied (the server does not apply approved scope requests)',
      errorIds.SCOPE_UPDATE_NOT_APPLIED, fc);
  }
  const result = {
    updateAcceptEventId: event.id,
    dataGrantAccessId: fc.accessId || null,
    // Kept for callers of earlier versions; same value as dataGrantAccessId.
    newDataGrantAccessId: fc.accessId || null,
    newPermissions: fc.newPermissions || [],
    status: fc.status,
    peerNotified: fc.status === 'completed'
  };
  if (fc.status === 'failed') result.deliveryFailure = fc.failure;
  return result;
}

/**
 * Refuse a scope-update proposal. Same id and waiting rules as
 * `acceptScopeUpdate`; resolves `{ updateRefuseEventId, status, peerNotified }`
 * and throws `CmcError` when the server rejected the refusal.
 *
 * @param {Object} conn
 * @param {string} scopeRequestEventId
 * @param {Object} [opts]
 * @param {string} [opts.scopeStreamId]
 * @param {Object} [opts.reason]
 * @param {boolean} [opts.waitForCompletion=true]
 * @param {number}  [opts.completionTimeoutMs=20000]
 * @param {number}  [opts.completionPollIntervalMs=200]
 * @returns {Promise<{updateRefuseEventId:string, status:string, peerNotified?:boolean}>}
 */
async function refuseScopeUpdate (conn, scopeRequestEventId, opts) {
  opts = opts || {};
  const scopeStreamId = opts.scopeStreamId || await resolveScopeRequestStream(conn, scopeRequestEventId);
  const content = { scopeRequestEventId, accept: false };
  if (opts.reason) content.reason = opts.reason;
  const event = await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_SCOPE_UPDATE,
    content
  }, 'event');
  if (opts.waitForCompletion === false) {
    return { updateRefuseEventId: event.id, status: 'pending' };
  }
  const fc = await waitScopeUpdate(conn, event.id, opts);
  // The refusal stands once the server recorded it (`applied: false`); only
  // telling the collector may still be pending or failed.
  if (fc.applied === false && fc.status !== 'completed') {
    const failure = fc.failure && fc.failure.reason;
    if (fc.status === 'failed' && !(typeof failure === 'string' && failure.startsWith('cmc-handler-delivery'))) {
      throw scopeUpdateFailure(fc);
    }
    const result = { updateRefuseEventId: event.id, status: fc.status, peerNotified: false };
    if (fc.status === 'failed') result.deliveryFailure = fc.failure;
    return result;
  }
  if (fc.status === 'failed') throw scopeUpdateFailure(fc);
  return { updateRefuseEventId: event.id, status: fc.status, peerNotified: true };
}

// Default wait for scope triggers. Must exceed the core's single outbound
// delivery attempt (15 s by default): the grant is applied before delivery, so
// giving up earlier would report a failure for a change that happened.
const SCOPE_WAIT_DEFAULT_MS = 20000;

/**
 * Wait for a scope trigger to settle. On timeout, read it once more: an
 * outcome the server already recorded (`applied` true or false) is returned
 * as is (status still `delivered`, the peer not reached yet); otherwise throw
 * `cmc-scope-update-outcome-unknown` rather than claiming a failure.
 */
async function waitScopeUpdate (conn, eventId, opts) {
  try {
    const finalEvent = await pollTriggerCompletion(conn, eventId, {
      timeoutMs: opts.completionTimeoutMs || SCOPE_WAIT_DEFAULT_MS,
      intervalMs: opts.completionPollIntervalMs || 200
    });
    return finalEvent.content || {};
  } catch (err) {
    if (!(err instanceof CmcError) || err.id !== errorIds.CAPABILITY_TIMEOUT) throw err;
    const last = await conn.apiOne('events.getOne', { id: eventId }, 'event');
    const lc = (last && last.content) || {};
    if (typeof lc.applied === 'boolean') return lc;
    throw new CmcError('CMC scope update outcome not known yet (last status: ' + lc.status + ')',
      errorIds.SCOPE_UPDATE_OUTCOME_UNKNOWN, { updateEventId: eventId, lastStatus: lc.status });
  }
}

function scopeUpdateFailure (fc) {
  const reason = (fc.failure && fc.failure.reason) || errorIds.HANDLER_THREW;
  return new CmcError('CMC scope update failed: ' + reason, reason, fc.failure);
}

async function resolveScopeRequestStream (conn, scopeRequestEventId) {
  const ev = await conn.apiOne('events.getOne', { id: scopeRequestEventId }, 'event');
  return (ev.streamIds && ev.streamIds[0]) || ev.streamId;
}

// --- Group membership ---
//
// A group (a practice, a research team) is an ordinary Pryv account. A member
// is another account holding a membership: a CMC relationship in which the
// member is the requester and the group the accepter, so the grant minted on
// the group's account IS the member's access to it (`role: 'member'`).
// Members invite patients from the group's account (`createInvite` with
// `accessType: 'app'` on a team stream), then ask the group's core for a
// short-lived access on a patient's account (`requestMemberAccess`); the
// group's core creates it through the patient's grant and returns it once.

/** Mirror of the server's rule: a `:_cmc:apps:*` stream outside chats/collectors. */
function isUserCreatableStreamId (streamId) {
  return typeof streamId === 'string' &&
    streamId.startsWith(NS_APPS + ':') &&
    !isAppNestedPluginStream(streamId);
}

function assertIdentity (fnName, label, value) {
  if (value == null || typeof value.username !== 'string' || value.username.length === 0 ||
      typeof value.host !== 'string' || value.host.length === 0) {
    throw new Error(fnName + ': ' + label + ' must be { username, host } with non-empty strings');
  }
}

/**
 * The `cmc-*` id of an API error answered by the server (`error.data.id`),
 * or null when the error is not a CMC refusal.
 */
function cmcIdFromApiError (err) {
  if (err == null) return null;
  const inner = err.innerObject;
  const candidates = [
    inner && inner.data && inner.data.id,
    inner && inner.id,
    err.data && err.data.id
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('cmc-')) return c;
  }
  return null;
}

/**
 * Member side: ask to join a group. Writes a `consent/request-cmc` offer on
 * the member's own account with `request.membership: true`, asking for
 * `contribute` on the group's team streams. Hand the returned `capabilityUrl`
 * to a group administrator (QR code or link): they open it with
 * `acceptMembership`. Nothing is delivered to the group automatically.
 *
 * The server refuses a membership offer asking for anything but
 * `:_cmc:apps:<app>[:<path>]` streams (chats and collectors excluded) at
 * `read` or `contribute`; this helper checks the same rule before writing and
 * throws `cmc-membership-permissions-invalid`.
 *
 * @param {Object} conn                    member's connection
 * @param {Object} params
 * @param {{username:string, host:string}} params.group - the group account
 * @param {string[]} params.scopeStreamIds - team streams on the GROUP's account
 * @param {string} params.appCode
 * @param {string} params.displayName      - how the member is shown to the administrator
 * @param {string} [params.scopeStreamId]  - stream on the MEMBER's account where the offer is written (default `:_cmc:apps:<appCode>`)
 * @param {Object} [params.title]
 * @param {Object} [params.description]
 * @param {Object} [params.consent]
 * @param {{chat?:boolean, systemMessaging?:boolean}} [params.features] - default
 *   `{ chat: false, systemMessaging: true }`. A membership never has chat: the
 *   server treats `chat` as false whatever is sent. Alerts to the member stay.
 * @param {number} [params.expiresAt]      - Unix seconds; default 7 days
 * @param {Object} [params.requesterMeta]
 * @returns {Promise<{inviteEventId:string, capabilityUrl:string, mode:string, expiresAt:number|null, group:{username:string, host:string}}>}
 */
async function requestMembership (conn, params) {
  if (params == null) throw new Error('requestMembership: params required');
  assertIdentity('requestMembership', 'params.group', params.group);
  for (const key of ['appCode', 'displayName']) {
    if (typeof params[key] !== 'string' || params[key].length === 0) {
      throw new Error('requestMembership: params.' + key + ' must be a non-empty string');
    }
  }
  const ids = params.scopeStreamIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new CmcError('requestMembership: params.scopeStreamIds must list at least one team stream',
      errorIds.MEMBERSHIP_PERMISSIONS_INVALID);
  }
  for (const id of ids) {
    if (!isUserCreatableStreamId(id)) {
      throw new CmcError('requestMembership: ' + JSON.stringify(id) +
        ' is not a team stream (:_cmc:apps:<app>[:<path>], chats and collectors excluded)',
      errorIds.MEMBERSHIP_PERMISSIONS_INVALID);
    }
  }
  const invite = await writeOffer(conn, {
    appCode: params.appCode,
    scopeStreamId: params.scopeStreamId || appScope(params.appCode),
    displayName: params.displayName,
    requestedPermissions: ids.map(function (streamId) { return { streamId, level: 'contribute' }; }),
    title: params.title,
    description: params.description,
    consent: params.consent,
    features: Object.assign({ chat: false, systemMessaging: true }, params.features || {}),
    expiresAt: params.expiresAt,
    requesterMeta: params.requesterMeta
  }, { membership: true, allowUserChoice: true }, 'requestMembership');
  invite.group = { username: params.group.username, host: params.group.host };
  return invite;
}

/**
 * Member side: wait for the group's acceptance of a membership request and
 * return the membership endpoint (an access on the group's account). Only an
 * acceptance from `opts.group` counts: anyone holding the link could accept
 * it, and only the expected group makes it a membership. When the arrival
 * carries the server's `membership` marker, it must be true.
 *
 * The administrator approves by hand: pass a long `timeoutMs`, call again
 * after a `cmc-capability-timeout`, or watch `:_cmc:inbox` with a Monitor.
 *
 * @param {Object} conn                    member's connection (needs read on `:_cmc:inbox`)
 * @param {Object} opts
 * @param {{username:string, host:string}} opts.group
 * @param {string} [opts.appCode]          - the appCode given to requestMembership
 * @param {number} [opts.sinceTime]
 * @param {number} [opts.timeoutMs=15000]
 * @param {number} [opts.intervalMs=300]
 * @returns {Promise<{acceptInboxEventId:string, membershipApiEndpoint:string|null, group:{username:string, host:string}|null, features:Object}>}
 */
async function waitForMembership (conn, opts) {
  opts = opts || {};
  assertIdentity('waitForMembership', 'opts.group', opts.group);
  const arrived = await pollInboxAccept(conn, {
    fromUsername: opts.group.username,
    fromHost: opts.group.host,
    appCode: opts.appCode,
    sinceTime: opts.sinceTime,
    timeoutMs: opts.timeoutMs,
    intervalMs: opts.intervalMs
  }, function (content) {
    // When the arrival carries the `membership` marker, it must be true; an
    // arrival without the field (a core that does not stamp it) is matched on
    // the group and appCode alone, as before.
    return !('membership' in content) || content.membership === true;
  });
  return {
    acceptInboxEventId: arrived.acceptInboxEventId,
    membershipApiEndpoint: arrived.grantedAccessApiEndpoint,
    group: arrived.counterparty,
    features: arrived.features
  };
}

/**
 * Member side: get an access on a patient's account. Writes a
 * `consent/member-access-cmc` trigger on the group's account through the
 * membership connection; the group's core creates a `shared` access on the
 * patient's account through the patient's grant (which must be delegable:
 * invite patients with `accessType: 'app'`) and answers it in the same
 * response. The access is named after the member and expires (24 h by
 * default). Its `apiEndpoint` carries a token: returned once, never stored by
 * the server. Do not log it.
 *
 * Throws `CmcError`: `err.id` is the server's refusal (`error.data.id`) or the
 * reason recorded on the trigger. `isMemberAccessRetryable(err)` is true for
 * `cmc-member-access-in-flight` and `cmc-member-access-peer-unreachable`: ask
 * again shortly. On a refusal at write, the server's `error.data` stays on
 * `err.cause.innerObject.data`: `cmc-member-access-relationship-not-found` with
 * `data.reason === 'offer-not-found'` means the group's invite to that patient
 * was deleted (invite the patient again), `'handshake-incomplete'` that the
 * relationship is not established yet. Against a core that does not support
 * member access the id is
 * `cmc-member-access-unsupported` (client-side); when the core created the
 * access but the answer arrived without the token it is
 * `cmc-member-access-token-missing` (client-side): ask again.
 *
 * @param {Object} conn                    membership connection (the member's access on the group's account)
 * @param {Object} params
 * @param {{username:string, host:string}} params.counterparty - the patient
 * @param {string} [params.streamId]       - team stream the trigger is written on (default `params.scopeStreamId`)
 * @param {string} [params.scopeStreamId]  - the patient relationship's scope; must be `streamId` or under it (default: `streamId`)
 * @param {Array<{streamId:string, level:string}>} [params.permissions] - default: the offer's streams at `read`
 * @param {number} [params.expireAfter]    - seconds; the core bounds it (60 s to 7 days by default)
 * @returns {Promise<{triggerEventId:string|null, apiEndpoint:string, accessId:string, name:string, expires:number, attribution:'stamped'|'name-only'}>}
 */
async function requestMemberAccess (conn, params) {
  if (params == null) throw new Error('requestMemberAccess: params required');
  assertIdentity('requestMemberAccess', 'params.counterparty', params.counterparty);
  const streamId = params.streamId || params.scopeStreamId;
  if (typeof streamId !== 'string' || streamId.length === 0) {
    throw new Error('requestMemberAccess: params.streamId (a team stream your membership can contribute to) or params.scopeStreamId required');
  }
  const content = {
    counterparty: { username: params.counterparty.username, host: params.counterparty.host }
  };
  if (params.scopeStreamId != null) content.scopeStreamId = params.scopeStreamId;
  if (params.permissions != null) content.permissions = params.permissions;
  if (params.expireAfter != null) content.expireAfter = params.expireAfter;
  let result;
  try {
    // No result key: the answer carries `memberAccess` beside `event`.
    result = await conn.apiOne('events.create', {
      streamIds: [streamId],
      type: ET_MEMBER_ACCESS,
      content
    });
  } catch (err) {
    const id = cmcIdFromApiError(err);
    if (id != null) throw new CmcError('CMC member access refused: ' + id, id, err);
    throw err;
  }
  const event = (result && result.event) || null;
  const memberAccess = result && result.memberAccess;
  if (memberAccess != null && typeof memberAccess.apiEndpoint === 'string') {
    return {
      triggerEventId: event ? event.id : null,
      apiEndpoint: memberAccess.apiEndpoint,
      accessId: memberAccess.accessId,
      name: memberAccess.name,
      expires: memberAccess.expires,
      attribution: memberAccess.attribution
    };
  }
  const c = (event && event.content) || {};
  if (c.status === 'failed') {
    const reason = (c.failure && c.failure.reason) || errorIds.HANDLER_THREW;
    throw new CmcError('CMC member access failed: ' + reason, reason, c.failure);
  }
  if (c.memberAccess != null) {
    // The trigger records the access, so the core supports member access:
    // the token was lost on the way (a proxy or wrapper dropping the field).
    throw new CmcError('CMC member access: the access was created but the answer carried no token; ask again',
      errorIds.MEMBER_ACCESS_TOKEN_MISSING, { triggerEventId: event ? event.id : null, accessId: c.memberAccess.accessId || null });
  }
  throw new CmcError('CMC member access: the group\'s core answered without an access (it does not support member access)',
    errorIds.MEMBER_ACCESS_UNSUPPORTED, { triggerEventId: event ? event.id : null, status: c.status });
}

/**
 * True when a `requestMemberAccess` failure is worth asking again shortly:
 * another request for the same patient was running, or the patient's core
 * could not be reached.
 *
 * @param {*} err
 * @returns {boolean}
 */
function isMemberAccessRetryable (err) {
  return err != null && (err.id === errorIds.MEMBER_ACCESS_IN_FLIGHT ||
    err.id === errorIds.MEMBER_ACCESS_PEER_UNREACHABLE);
}

/**
 * Member side: leave a group. Revokes the membership from the member's
 * account; the group's core then deletes the accesses it created for this
 * member on patients' accounts.
 *
 * @param {Object} conn                    member's connection
 * @param {Object} params
 * @param {string} [params.inviteEventId]  - from requestMembership
 * @param {string} [params.accessId]       - the member's back-channel access, instead of inviteEventId
 * @param {string} [params.scopeStreamId]  - stream the revoke is written on (default: the request's stream)
 * @param {Object} [params.reason]
 * @returns {Promise<void>}
 */
async function leaveMembership (conn, params) {
  if (params == null) throw new Error('leaveMembership: params required');
  if (params.accessId) return revokeRelationship(conn, params);
  if (!params.inviteEventId) {
    throw new Error('leaveMembership: provide inviteEventId (from requestMembership) or accessId');
  }
  const invite = await getInviteStatus(conn, params.inviteEventId);
  if (invite.backChannelAccessId) {
    return revokeRelationship(conn, {
      accessId: invite.backChannelAccessId,
      scopeStreamId: params.scopeStreamId || invite.scopeStreamId,
      reason: params.reason
    });
  }
  if (invite.status !== 'accepted') {
    // Nothing to leave: an unaccepted single-use request simply expires.
    throw new CmcError('leaveMembership: the request is not accepted (status ' + invite.status + ')' +
      (invite.expiresAt != null ? '; it expires at ' + invite.expiresAt : '') + ', so there is no membership to leave',
    errorIds.CAPABILITY_INVALID, { inviteEventId: params.inviteEventId, status: invite.status, expiresAt: invite.expiresAt });
  }
  return revokeRelationship(conn, params);
}

/**
 * Administrator side: approve a membership request. Reads the offer, refuses
 * an ordinary offer (`cmc-membership-offer-expected`, client-side), and writes
 * the accept with the administrator's token: the group's personal token or a
 * delegate's. `grantedScopes` narrows the teams to a subset of those
 * requested (a membership offer always allows it).
 *
 * @param {Object} conn                    group administrator's connection (personal or delegate token)
 * @param {string} capabilityUrl           - the member's membership link
 * @param {Object} opts
 * @param {string} opts.scopeStreamId      - REQUIRED. Group's `:_cmc:apps:<app>[:...]` stream where the accept lands.
 * @param {string[]} [opts.grantedScopes]  - team stream ids to grant (default: all requested)
 * @param {string} [opts.accessName]
 * @param {boolean} [opts.waitForCompletion=true]
 * @param {number}  [opts.completionTimeoutMs=10000]
 * @param {number}  [opts.completionPollIntervalMs=200]
 * @returns {Promise<{acceptEventId:string, membershipAccessId:string|null, member:Object, status?:string}>}
 */
async function acceptMembership (conn, capabilityUrl, opts) {
  opts = opts || {};
  requireAcceptScope(opts, 'acceptMembership');
  const offer = await readOffer(capabilityUrl, opts);
  if (!offer.membership) {
    throw new CmcError('acceptMembership: this offer is not a membership request (use acceptInvite)',
      errorIds.MEMBERSHIP_OFFER_EXPECTED);
  }
  const acceptOpts = Object.assign({}, opts);
  delete acceptOpts.grantedScopes;
  if (opts.grantedScopes != null) {
    if (!Array.isArray(opts.grantedScopes) || opts.grantedScopes.length === 0) {
      throw new Error('acceptMembership: opts.grantedScopes must list at least one team (decline instead)');
    }
    acceptOpts.grantedPermissions = opts.grantedScopes.map(function (streamId) {
      const requested = offer.requestedPermissions.find(function (p) { return p.streamId === streamId; });
      if (requested == null) {
        throw new CmcError('acceptMembership: ' + JSON.stringify(streamId) + ' was not requested',
          errorIds.GRANTED_PERMISSIONS_NOT_SUBSET);
      }
      return { streamId: requested.streamId, level: requested.level };
    });
  }
  const accepted = await acceptOffer(conn, capabilityUrl, acceptOpts, offer);
  const result = {
    acceptEventId: accepted.acceptEventId,
    membershipAccessId: accepted.dataGrantAccessId,
    member: accepted.counterparty
  };
  if (accepted.status != null) result.status = accepted.status;
  return result;
}

/**
 * Administrator side: decline a membership request (a refusal; no access is
 * created).
 *
 * @param {Object} conn
 * @param {string} capabilityUrl
 * @param {Object} opts
 * @param {string} opts.scopeStreamId      - REQUIRED. Group's stream where the refusal lands.
 * @param {Object} [opts.reason]
 * @returns {Promise<{refuseEventId:string}>}
 */
async function declineMembership (conn, capabilityUrl, opts) {
  return refuseInvite(conn, capabilityUrl, opts);
}

function memberRecordFromAccess (access) {
  const c = access.clientData.cmc;
  const cp = c.counterparty || {};
  const membership = c.membership || {};
  return {
    membershipAccessId: access.id,
    // Identity only: the counterparty's endpoint is never copied.
    member: { username: cp.username || null, host: cp.host || null },
    appCode: c.appCode || null,
    scopeStreamId: c.scopeStreamId || null,
    scopes: (access.permissions || [])
      .filter(function (p) { return isUserCreatableStreamId(p.streamId); })
      .map(function (p) { return { streamId: p.streamId, level: p.level }; }),
    requestedScopes: Array.isArray(membership.requestedScopes) ? membership.requestedScopes : [],
    approvedBy: membership.approvedBy != null ? membership.approvedBy : null,
    acceptEventId: c.acceptEventId || null,
    created: access.created != null ? access.created : null,
    expires: access.expires != null ? access.expires : null
  };
}

/**
 * Administrator side: list the group's members (accesses with
 * `clientData.cmc.role === 'member'`). Needs a token allowed to list the
 * group's accesses (personal token).
 *
 * @param {Object} conn
 * @returns {Promise<Array>}
 */
async function listMembers (conn) {
  const accesses = await conn.apiOne('accesses.get', {}, 'accesses');
  return (accesses || [])
    .filter(function (a) {
      return a != null && a.clientData != null && a.clientData.cmc != null &&
        a.clientData.cmc.role === 'member';
    })
    .map(memberRecordFromAccess);
}

/**
 * Administrator side: end a membership. Writes a `consent/revoke-cmc` for the
 * membership access; the group's core deletes it, tells the member, and
 * sweeps the accesses it created for this member on patients' accounts
 * (follow it with `listSweeps` / `getSweepStatus`).
 *
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.membershipAccessId
 * @param {string} params.scopeStreamId    - group's stream the revoke is written on (`scopeStreamId` from listMembers)
 * @param {Object} [params.reason]
 * @returns {Promise<{revokeEventId:string}>}
 */
async function revokeMembership (conn, params) {
  if (params == null || !params.membershipAccessId || !params.scopeStreamId) {
    throw new Error('revokeMembership: params.membershipAccessId and params.scopeStreamId required');
  }
  const content = { accessId: params.membershipAccessId };
  if (params.reason) content.reason = params.reason;
  const event = await conn.apiOne('events.create', {
    streamIds: [params.scopeStreamId],
    type: ET_REVOKE,
    content
  }, 'event');
  return { revokeEventId: event.id };
}

function sweepRecordFromEvent (event) {
  const c = (event && event.content) || {};
  return {
    sweepEventId: event.id,
    member: c.member || null,
    membershipAccessId: c.membershipAccessId || null,
    reason: c.reason || null,
    status: c.status || 'pending',
    failure: c.failure || null,
    records: Array.isArray(c.records) ? c.records : [],
    outcome: Array.isArray(c.outcome) ? c.outcome : [],
    residuals: Array.isArray(c.residuals) ? c.residuals : [],
    // `narrowed` by the deletion of a team stream: the stream(s) deleted.
    uncovered: Array.isArray(c.uncovered) ? c.uncovered.filter((s) => typeof s === 'string') : [],
    scopeStreamId: (event.streamIds && event.streamIds[0]) || event.streamId || null,
    time: event.time != null ? event.time : null
  };
}

/**
 * Administrator side: read one offboarding sweep (`consent/member-revoke-cmc`,
 * written by the server when a membership ends): what it deleted and the
 * residuals it could not reach.
 *
 * @param {Object} conn
 * @param {string} sweepEventId
 * @returns {Promise<Object>}
 */
async function getSweepStatus (conn, sweepEventId) {
  const event = await conn.apiOne('events.getOne', { id: sweepEventId }, 'event');
  return sweepRecordFromEvent(event);
}

/**
 * Administrator side: list offboarding sweeps, most recent first.
 * `membershipAccessId` filters the events read (at most `limit`).
 *
 * @param {Object} conn
 * @param {Object} [params]
 * @param {string} [params.scopeStreamId=':_cmc:apps']
 * @param {string} [params.membershipAccessId]
 * @param {number} [params.limit=100]
 * @returns {Promise<{items:Array, truncated:boolean}>}
 */
async function listSweeps (conn, params) {
  params = params || {};
  const limit = params.limit || 100;
  const events = await conn.apiOne('events.get', {
    streams: [params.scopeStreamId || NS_APPS],
    types: [ET_MEMBER_REVOKE],
    limit,
    sortAscending: false
  }, 'events');
  let items = events.map(sweepRecordFromEvent);
  if (params.membershipAccessId) {
    items = items.filter(function (s) { return s.membershipAccessId === params.membershipAccessId; });
  }
  return { items, truncated: events.length >= limit };
}

// --- Accept hand-off (app-web-user-account) ---
//
// `acceptInvite` posts the trigger directly on a `pryv.Connection`.
// Since CMC's accept/scope-update/revoke triggers now require a
// PERSONAL access token server-side, apps that hold only an app- or
// shared-access token cannot accept directly: they delegate the
// authentication to app-web-user-account's `/cmc-accept` page, which prompts
// the user to sign in, writes the trigger with the fresh personal
// token, and returns the resulting data-grant apiEndpoint to the
// caller. Two helpers: `requestAcceptUrl` (URL only, for caller-driven
// flows) and `requestAccept` (full popup-or-redirect + result promise).

const REQUEST_ACCEPT_POSTMSG_TYPE = 'cmc-accept-result';

/**
 * Normalise `opts.expectedOrigin` to a serialized origin (lowercase
 * scheme + host, default port dropped, no path or trailing slash), as
 * found in `MessageEvent.origin`. Returns null when not set.
 * @param {Object} [opts]
 * @param {string} fnName  caller name, for the error message.
 * @returns {string|null}
 * @throws {CmcError} 'cmc-invalid-expected-origin' when not a parsable absolute URL.
 */
function normalizeExpectedOrigin (opts, fnName) {
  const raw = opts && opts.expectedOrigin;
  if (raw == null || raw === '') return null;
  let origin = null;
  if (typeof raw === 'string') {
    try { origin = new URL(raw).origin; } catch (_e) { origin = null; }
  }
  if (origin == null || origin === 'null') {
    throw new CmcError(fnName + ': opts.expectedOrigin must be an absolute URL such as \'https://account.example.com\' (got ' + JSON.stringify(raw) + ')',
      'cmc-invalid-expected-origin');
  }
  return origin;
}

/**
 * True when a `message` event was posted by the popup this helper opened
 * (and, when `expectedOrigin` is set, from that origin). Any other
 * window or frame can post to the opener, so a result is only trusted
 * when `ev.source` is the popup. The origin is not compared to `authUrl`
 * by default: the account app may redirect to another origin.
 * @param {MessageEvent} ev
 * @param {Window} popup
 * @param {string|null} expectedOrigin  normalised origin, or null.
 * @returns {boolean}
 */
function isFromPopup (ev, popup, expectedOrigin) {
  if (ev == null || ev.source == null || ev.source !== popup) return false;
  if (expectedOrigin != null && ev.origin !== expectedOrigin) return false;
  return true;
}

/**
 * Build the `/cmc-accept` URL with query parameters for the
 * app-web-user-account hand-off. Use this if you want to drive the navigation
 * yourself (e.g., custom popup options, deep-link on mobile).
 *
 * @param {Object} opts
 * @param {string} opts.authUrl         - app-web-user-account base + `/cmc-accept` path (e.g. `https://account.pryv.me/cmc-accept`).
 * @param {string} opts.pryvApi         - recipient's Pryv API base (e.g. `https://reg.pryv.me/`).
 * @param {string} opts.capabilityUrl   - capability URL from the requester's invite.
 * @param {string} opts.scopeStreamId   - recipient's `:_cmc:apps:<app>[:...]` stream.
 * @param {string} [opts.accessName]    - optional override for the data-grant access name.
 * @param {string} [opts.returnUrl]     - for redirect-mode flows; the page navigates here with `?cmcAcceptResult=<json>`.
 * @returns {string}
 */
function requestAcceptUrl (opts) {
  if (opts == null) throw new Error('requestAcceptUrl: opts required');
  if (typeof opts.authUrl !== 'string' || opts.authUrl.length === 0) {
    throw new Error('requestAcceptUrl: opts.authUrl required');
  }
  if (typeof opts.capabilityUrl !== 'string' || opts.capabilityUrl.length === 0) {
    throw new Error('requestAcceptUrl: opts.capabilityUrl required');
  }
  if (typeof opts.scopeStreamId !== 'string' || opts.scopeStreamId.length === 0) {
    throw new Error('requestAcceptUrl: opts.scopeStreamId required');
  }
  if (typeof opts.pryvApi !== 'string' || opts.pryvApi.length === 0) {
    throw new Error('requestAcceptUrl: opts.pryvApi required');
  }
  const q = [
    'capabilityUrl=' + encodeURIComponent(opts.capabilityUrl),
    'scopeStreamId=' + encodeURIComponent(opts.scopeStreamId),
    'pryvApi=' + encodeURIComponent(opts.pryvApi)
  ];
  if (typeof opts.accessName === 'string' && opts.accessName.length > 0) {
    q.push('accessName=' + encodeURIComponent(opts.accessName));
  }
  if (typeof opts.returnUrl === 'string' && opts.returnUrl.length > 0) {
    q.push('returnUrl=' + encodeURIComponent(opts.returnUrl));
    q.push('mode=redirect');
  } else {
    q.push('mode=popup');
  }
  const sep = opts.authUrl.includes('?') ? '&' : '?';
  return opts.authUrl + sep + q.join('&');
}

/**
 * Open the `/cmc-accept` hand-off and return a Promise resolving to
 * the result. Browser-only — relies on `window.open` + `postMessage`
 * (popup mode) or `window.location.assign` (redirect mode). For
 * non-browser contexts, use `requestAcceptUrl` and drive navigation
 * yourself.
 *
 * Popup mode (default):
 *   Opens a child window, listens for a `cmc-accept-result`
 *   postMessage from it (messages whose `source` is not that window
 *   are ignored), returns `{ ok, acceptEventId }`. Rejects
 *   with CmcError on `ok: false`, on user closing the popup without
 *   acting, or on timeout. `acceptEventId` is an id on the accepter's
 *   account and carries no access token: the requester obtains the
 *   data-grant endpoint on its own side with `waitForAccept`
 *   (`grantedAccessApiEndpoint`).
 *
 * Redirect mode:
 *   Navigates the current window to `/cmc-accept` with a `returnUrl`
 *   query so the page returns by re-navigating. Returns nothing (the
 *   navigation happens synchronously). The receiving page is
 *   responsible for parsing `?cmcAcceptResult=<json>` on `returnUrl`.
 *
 * @param {Object} opts                  same shape as requestAcceptUrl, plus:
 * @param {'popup'|'redirect'} [opts.mode='popup']
 * @param {string} [opts.popupFeatures]  `window.open` features string (popup mode).
 * @param {number} [opts.timeoutMs=600000]  popup-mode max wait (default 10 min).
 * @param {string} [opts.expectedOrigin]  popup mode: also require the result message to come from this
 *   origin. Any absolute URL is accepted and reduced to its origin (`https://Account.Example.com:443/x`
 *   becomes `https://account.example.com`); an unparsable value rejects with `cmc-invalid-expected-origin`.
 *   Recommended whenever the account app's origin is known.
 * @returns {Promise<{ok:boolean, acceptEventId?:string, reason?:string, redirected?:boolean}>}
 */
function requestAccept (opts) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('requestAccept: window required (browser-only). Use requestAcceptUrl for non-browser flows.'));
  }
  const mode = (opts && opts.mode) || (opts && opts.returnUrl ? 'redirect' : 'popup');
  const url = requestAcceptUrl(Object.assign({}, opts, { returnUrl: mode === 'redirect' ? opts.returnUrl : undefined }));
  if (mode === 'redirect') {
    window.location.assign(url);
    return Promise.resolve({ ok: true, redirected: true });
  }
  // popup mode
  const features = (opts && opts.popupFeatures) || 'width=480,height=720,resizable=yes,scrollbars=yes';
  let expectedOrigin;
  try {
    expectedOrigin = normalizeExpectedOrigin(opts, 'requestAccept');
  } catch (e) {
    return Promise.reject(e);
  }
  const popup = window.open(url, 'cmcAccept', features);
  if (popup == null) {
    return Promise.reject(new CmcError('requestAccept: popup blocked. Pass opts.returnUrl + mode=\'redirect\' as a fallback.', 'cmc-accept-popup-blocked'));
  }
  const timeoutMs = (opts && opts.timeoutMs) || 600000;
  return new Promise(function (resolve, reject) {
    let settled = false;
    function onMessage (ev) {
      if (!isFromPopup(ev, popup, expectedOrigin)) return;
      const data = ev.data;
      if (data == null || data.type !== REQUEST_ACCEPT_POSTMSG_TYPE) return;
      settle();
      if (data.ok) {
        resolve({
          ok: true,
          acceptEventId: data.acceptEventId
        });
      } else {
        reject(new CmcError('CMC accept hand-off returned ok=false: ' + (data.reason || 'unknown'),
          data.reason || 'cmc-accept-failed'));
      }
    }
    function settle () {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);
      clearInterval(closedPoll);
      clearTimeout(timer);
    }
    const closedPoll = setInterval(function () {
      if (popup.closed) {
        settle();
        reject(new CmcError('CMC accept hand-off: popup closed before result', 'cmc-accept-popup-closed'));
      }
    }, 500);
    const timer = setTimeout(function () {
      settle();
      try { popup.close(); } catch (_e) { /* cross-origin */ }
      reject(new CmcError('CMC accept hand-off timed out after ' + timeoutMs + 'ms', 'cmc-accept-timeout'));
    }, timeoutMs);
    window.addEventListener('message', onMessage);
  });
}

// --- Scope-update accept hand-off (app-web-user-account) ---
//
// `acceptScopeUpdate` posts the trigger directly on a `pryv.Connection`.
// Since the server gates `consent/scope-update-cmc` to personal tokens
// only (mirrors the accept gate), apps holding app/shared tokens hand
// off to `app-web-user-account`'s `/cmc-scope-update` page. Two helpers:
// `requestScopeUpdateUrl` (URL only) and `requestScopeUpdate` (full
// popup-or-redirect + result promise). Symmetric to requestAccept /
// requestAcceptUrl above.

const REQUEST_SCOPE_UPDATE_POSTMSG_TYPE = 'cmc-scope-update-result';

/**
 * Build the `/cmc-scope-update` URL with query parameters for the
 * app-web-user-account hand-off.
 *
 * @param {Object} opts
 * @param {string} opts.authUrl              - app-web-user-account base + `/cmc-scope-update`.
 * @param {string} opts.pryvApi              - user's Pryv API base.
 * @param {string} opts.scopeRequestEventId  - the id of the request on the USER's account: `remoteScopeRequestEventId` from `proposeScopeUpdate` (not the collector-side trigger id).
 * @param {string} [opts.scopeStreamId]      - own collector stream (defaults to the request's home stream when omitted).
 * @param {string} [opts.returnUrl]          - switches to redirect mode.
 * @returns {string}
 */
function requestScopeUpdateUrl (opts) {
  if (opts == null) throw new Error('requestScopeUpdateUrl: opts required');
  if (typeof opts.authUrl !== 'string' || opts.authUrl.length === 0) {
    throw new Error('requestScopeUpdateUrl: opts.authUrl required');
  }
  if (typeof opts.scopeRequestEventId !== 'string' || opts.scopeRequestEventId.length === 0) {
    throw new Error('requestScopeUpdateUrl: opts.scopeRequestEventId required');
  }
  if (typeof opts.pryvApi !== 'string' || opts.pryvApi.length === 0) {
    throw new Error('requestScopeUpdateUrl: opts.pryvApi required');
  }
  const q = [
    'scopeRequestEventId=' + encodeURIComponent(opts.scopeRequestEventId),
    'pryvApi=' + encodeURIComponent(opts.pryvApi)
  ];
  if (typeof opts.scopeStreamId === 'string' && opts.scopeStreamId.length > 0) {
    q.push('scopeStreamId=' + encodeURIComponent(opts.scopeStreamId));
  }
  if (typeof opts.returnUrl === 'string' && opts.returnUrl.length > 0) {
    q.push('returnUrl=' + encodeURIComponent(opts.returnUrl));
    q.push('mode=redirect');
  } else {
    q.push('mode=popup');
  }
  const sep = opts.authUrl.includes('?') ? '&' : '?';
  return opts.authUrl + sep + q.join('&');
}

/**
 * Open the `/cmc-scope-update` hand-off and return a Promise resolving
 * to the result. Browser-only.
 *
 * Popup mode (default):
 *   Opens a child window; listens for a `cmc-scope-update-result`
 *   postMessage from it (messages whose `source` is not that window
 *   are ignored). Resolves with `{ ok: true, updateEventId,
 *   action: 'accept'|'refuse' }` on success; rejects with CmcError on
 *   ok: false / user-cancel / popup-blocked / timeout.
 *
 * Redirect mode:
 *   Navigates the current window to the page; the page returns by
 *   re-navigating to `returnUrl?cmcScopeUpdateResult=<json>`. Returns
 *   `{ ok: true, redirected: true }` immediately (the navigation
 *   completes asynchronously).
 *
 * @param {Object} opts                 same shape as requestScopeUpdateUrl, plus:
 * @param {'popup'|'redirect'} [opts.mode='popup']
 * @param {string} [opts.popupFeatures]
 * @param {number} [opts.timeoutMs=600000]
 * @param {string} [opts.expectedOrigin]  popup mode: also require the result message to come from this
 *   origin. Any absolute URL is accepted and reduced to its origin (`https://Account.Example.com:443/x`
 *   becomes `https://account.example.com`); an unparsable value rejects with `cmc-invalid-expected-origin`.
 *   Recommended whenever the account app's origin is known.
 * @returns {Promise<{ok:boolean, updateEventId?:string, action?:'accept'|'refuse', reason?:string, redirected?:boolean}>}
 */
function requestScopeUpdate (opts) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('requestScopeUpdate: window required (browser-only). Use requestScopeUpdateUrl for non-browser flows.'));
  }
  const mode = (opts && opts.mode) || (opts && opts.returnUrl ? 'redirect' : 'popup');
  const url = requestScopeUpdateUrl(Object.assign({}, opts, { returnUrl: mode === 'redirect' ? opts.returnUrl : undefined }));
  if (mode === 'redirect') {
    window.location.assign(url);
    return Promise.resolve({ ok: true, redirected: true });
  }
  const features = (opts && opts.popupFeatures) || 'width=480,height=720,resizable=yes,scrollbars=yes';
  let expectedOrigin;
  try {
    expectedOrigin = normalizeExpectedOrigin(opts, 'requestScopeUpdate');
  } catch (e) {
    return Promise.reject(e);
  }
  const popup = window.open(url, 'cmcScopeUpdate', features);
  if (popup == null) {
    return Promise.reject(new CmcError('requestScopeUpdate: popup blocked. Pass opts.returnUrl + mode=\'redirect\' as a fallback.', 'cmc-scope-update-popup-blocked'));
  }
  const timeoutMs = (opts && opts.timeoutMs) || 600000;
  return new Promise(function (resolve, reject) {
    let settled = false;
    function onMessage (ev) {
      if (!isFromPopup(ev, popup, expectedOrigin)) return;
      const data = ev.data;
      if (data == null || data.type !== REQUEST_SCOPE_UPDATE_POSTMSG_TYPE) return;
      settle();
      if (data.ok) {
        resolve({
          ok: true,
          updateEventId: data.updateEventId,
          action: data.action,
          peerNotified: data.peerNotified,
        });
      } else {
        reject(new CmcError('CMC scope-update hand-off returned ok=false: ' + (data.reason || 'unknown'),
          data.reason || 'cmc-scope-update-failed'));
      }
    }
    function settle () {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);
      clearInterval(closedPoll);
      clearTimeout(timer);
    }
    const closedPoll = setInterval(function () {
      if (popup.closed) {
        settle();
        reject(new CmcError('CMC scope-update hand-off: popup closed before result', 'cmc-scope-update-popup-closed'));
      }
    }, 500);
    const timer = setTimeout(function () {
      settle();
      try { popup.close(); } catch (_e) { /* cross-origin */ }
      reject(new CmcError('CMC scope-update hand-off timed out after ' + timeoutMs + 'ms', 'cmc-scope-update-timeout'));
    }, timeoutMs);
    window.addEventListener('message', onMessage);
  });
}

// --- Observation scopes (for use with `new pryv.Monitor(conn, scope)`) ---

const scopes = {
  /**
   * Inbox scope — `{ streams: [':_cmc:inbox'] }`.
   * Use for lifecycle events (request/accept/refuse/revoke arrivals).
   * @returns {{streams:string[]}}
   */
  inbox (_params) {
    return { streams: [NS_INBOX] };
  },
  /**
   * Chats scope. With only `appCode`, watches all chat activity under
   * the app-scope (`:_cmc:apps:<app-code>:chats`). With `peerSlug` as
   * well, narrows to a single counterparty stream.
   * @param {{appCode:string, peerSlug?:string, scopeStreamId?:string}} params
   * @returns {{streams:string[]}}
   */
  chats (params) {
    if (params == null || (!params.appCode && !params.scopeStreamId)) {
      throw new Error('cmc.scopes.chats: params.appCode or params.scopeStreamId required');
    }
    const scope = params.scopeStreamId || appScope(params.appCode);
    if (params.peerSlug) return { streams: [chatStreamUnder(scope, params.peerSlug)] };
    return { streams: [chatsParentUnder(scope)] };
  },
  /**
   * Collectors scope. Same semantics as `chats` but for system messages.
   * @param {{appCode:string, peerSlug?:string, scopeStreamId?:string}} params
   * @returns {{streams:string[]}}
   */
  collectors (params) {
    if (params == null || (!params.appCode && !params.scopeStreamId)) {
      throw new Error('cmc.scopes.collectors: params.appCode or params.scopeStreamId required');
    }
    const scope = params.scopeStreamId || appScope(params.appCode);
    if (params.peerSlug) return { streams: [collectorStreamUnder(scope, params.peerSlug)] };
    return { streams: [collectorsParentUnder(scope)] };
  }
};

module.exports = {
  // namespace constants
  NS,
  NS_INBOX,
  NS_APPS,
  NS_INTERNAL,
  NS_INTERNAL_RETRIES,
  // typed error-id catalogue (mirrors server-side CmcErrorIds)
  errorIds,
  CmcError,
  // event types
  ET_REQUEST,
  ET_ACCEPT,
  ET_REFUSE,
  ET_REVOKE,
  ET_INVALIDATE_LINK,
  ET_SCOPE_REQUEST,
  ET_SCOPE_UPDATE,
  ET_CHAT,
  ET_SYSTEM_ALERT,
  ET_SYSTEM_ACK,
  ET_SYSTEM_SCOPE_REQUEST,
  ET_SYSTEM_SCOPE_UPDATE,
  ET_MEMBER_ACCESS,
  ET_MEMBER_REVOKE,
  EVENT_TYPES_LIFECYCLE,
  EVENT_TYPES_CHAT,
  EVENT_TYPES_SYSTEM,
  // slug helpers
  SEPARATOR,
  slugifyHost,
  counterpartySlug,
  parseCounterpartySlug,
  // stream-id builders
  appScope,
  chatsParentUnder,
  chatStreamUnder,
  collectorsParentUnder,
  collectorStreamUnder,
  // classification + parsing
  isCmcStreamId,
  isAppNestedPluginStream,
  getAppCode,
  parseChatStreamId,
  parseCollectorStreamId,
  // Level-1 protocol functions
  createInvite,
  listInvites,
  getInviteStatus,
  listInviteAccepters,
  revokeRelationship,
  invalidateCapability,
  proposeScopeUpdate,
  readOffer,
  acceptInvite,
  waitForAccept,
  refuseInvite,
  revokeAcceptance,
  listAcceptedRelationships,
  sendChat,
  sendSystemAlert,
  sendSystemAck,
  acceptScopeUpdate,
  refuseScopeUpdate,
  // group membership
  requestMembership,
  waitForMembership,
  requestMemberAccess,
  isMemberAccessRetryable,
  leaveMembership,
  acceptMembership,
  declineMembership,
  listMembers,
  revokeMembership,
  getSweepStatus,
  listSweeps,
  // revocation arrivals (inbox)
  revocationFromEvent,
  revocationMatches,
  // accept hand-off (apps without a personal token)
  requestAccept,
  requestAcceptUrl,
  // scope-update accept hand-off (mirrors requestAccept)
  requestScopeUpdate,
  requestScopeUpdateUrl,
  // observation scopes
  scopes
};
