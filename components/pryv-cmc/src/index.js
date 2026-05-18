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
  // Trigger-event content shape
  HANDLER_MISSING_CAPABILITY_URL: 'cmc-handler-missing-capability-url',
  HANDLER_OFFER_MISSING_CAPABILITY_ID: 'cmc-handler-offer-missing-capability-id',
  OFFER_EMPTY_PERMISSIONS: 'cmc-offer-empty-permissions',
  // Handler routing
  HANDLER_WRONG_TYPE: 'cmc-handler-wrong-type',
  HANDLER_THREW: 'cmc-handler-threw',
  HANDLER_OFFER_READ_FAILED: 'cmc-handler-offer-read-failed',
  // Counterparty resolution
  HANDLER_COUNTERPARTY_UNKNOWN: 'cmc-handler-counterparty-unknown',
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
  CHAT_NO_REMOTE_CHAT_STREAM: 'cmc-chat-no-remote-chat-stream'
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
 * @param {number} [params.expiresAt]
 * @param {string|null} [params.to=null]
 * @param {Object} [params.requesterMeta]
 * @returns {Promise<{inviteEventId:string, capabilityUrl:string, mode:string, expiresAt:number}>}
 */
async function createInvite (conn, params) {
  if (params == null) throw new Error('createInvite: params required');
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
  if (params.expiresAt) request.expiresAt = params.expiresAt;
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

function inviteRecordFromEvent (event) {
  const c = (event && event.content) || {};
  return {
    inviteEventId: event.id,
    capabilityUrl: c.capabilityUrl || null,
    mode: (c.capability && c.capability.mode) || 'single-use',
    status: c.status || 'pending',
    expiresAt: c.capabilityExpiresAt || (c.request && c.request.expiresAt) || null,
    counterparty: c.acceptedBy || null,
    acceptedAt: c.acceptedAt || null,
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
 * Invalidate an open-link capability so it stops accepting NEW patients.
 * The provided `inviteEventId` is used to look up the trigger event and
 * read its `capabilityId`. Already-established relationships are
 * untouched. Idempotent; no-op on single-use capabilities.
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
 * @param {Object} conn
 * @param {Object} params
 * @param {string} params.collectorStreamId       - the provider's own collector stream
 * @param {Array<{streamId,level:string}>} params.newPermissions
 * @param {Object} [params.message]
 * @param {number} [params.expires]
 * @returns {Promise<{scopeRequestEventId:string}>}
 */
async function requestScopeUpdate (conn, params) {
  if (params == null) throw new Error('requestScopeUpdate: params required');
  const content = { newPermissions: params.newPermissions };
  if (params.message) content.message = params.message;
  if (params.expires) content.expires = params.expires;
  const event = await conn.apiOne('events.create', {
    streamIds: [params.collectorStreamId],
    type: ET_SCOPE_REQUEST,
    content
  }, 'event');
  return { scopeRequestEventId: event.id };
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
 * @returns {Promise<{requester:{username:string|null,host:string,displayName?:string}, consent:Object|undefined, requestedPermissions:Array, mode:string, features:Object}>}
 */
async function readOffer (capabilityUrl, opts) {
  const pryv = (opts && opts.pryv) || require('pryv');
  const cap = new pryv.Connection(capabilityUrl);
  const events = await cap.apiOne('events.get', {
    streamIds: [NS_INTERNAL + ':offer'],
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
  try {
    const info = await cap.service.info();
    const decomposed = pryv.utils.decomposeAPIEndpoint(capabilityUrl, info.api);
    // The capability access lives on the requester's platform — username
    // on the capability is the requester's username.
    const accessInfo = await cap.accessInfo();
    requesterIdentity = {
      username: (accessInfo && accessInfo.user && accessInfo.user.username) || decomposed.username,
      host: decomposed.host,
      displayName: meta.displayName
    };
  } catch (_e) {
    // Best-effort identity; offer content still returned.
  }
  return {
    requester: requesterIdentity,
    consent: request.consent,
    requestedPermissions: request.permissions || [],
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
 * By default resolves only after Phase 2 (trigger status='completed').
 * Throws CmcError carrying tagged failure.reason as error.id on 'failed'.
 *
 * Power users: opt out with { waitForCompletion: false } → resolves
 * immediately after events.create with { acceptEventId,
 * dataGrantAccessId, status: 'pending' } and observes completion
 * themselves.
 *
 * @param {Object} conn                     accepter's connection
 * @param {string} capabilityUrl
 * @param {Object} opts
 * @param {string} opts.scopeStreamId       - REQUIRED. Own :_cmc:apps:<app>[:...] stream where the accept trigger lands. Must NOT be :_cmc:inbox (which routes through the peer-delivered path).
 * @param {{chat?:boolean,systemMessaging?:boolean}} [opts.extra]
 * @param {string} [opts.accessName]
 * @param {boolean} [opts.waitForCompletion=true]
 * @param {number}  [opts.completionTimeoutMs=10000]
 * @param {number}  [opts.completionPollIntervalMs=200]
 * @returns {Promise<Object>}
 */
async function acceptInvite (conn, capabilityUrl, opts) {
  opts = opts || {};
  if (!opts.scopeStreamId) {
    throw new Error('acceptInvite: opts.scopeStreamId is required ' +
      '(an :_cmc:apps:<app>[:...] stream on YOUR account where the accept ' +
      'trigger lands — not :_cmc:inbox, which routes through the peer-delivered path)');
  }
  const scopeStreamId = opts.scopeStreamId;
  // Read the offer FIRST to capture counterparty identity (single-use
  // capabilities flip to 'consumed' on the first accept, so a second
  // read after submit would fail).
  let counterparty = { username: null, host: null, displayName: undefined };
  let offerFeatures = null;
  try {
    const offer = await readOffer(capabilityUrl, opts);
    counterparty = {
      username: offer.requester && offer.requester.username,
      host: offer.requester && offer.requester.host,
      displayName: offer.requester && offer.requester.displayName
    };
    offerFeatures = offer.features || null;
  } catch (_e) {
    // Best-effort; if offer read fails the accept can still proceed.
  }
  const content = { capabilityUrl };
  if (opts.extra) content.extra = opts.extra;
  if (opts.accessName) content.accessName = opts.accessName;
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
 * @param {Object} conn
 * @param {Object} [params]
 * @param {string} [params.scopeStreamId=':_cmc:apps']  - root or sub-scope to search recursively
 * @param {number} [params.limit=1000]
 * @returns {Promise<Array>}
 */
async function listAcceptedRelationships (conn, params) {
  params = params || {};
  // Default to the apps root (recursive) so callers get every relationship
  // across all of their app scopes. Pass `params.scopeStreamId` for a narrower
  // view (e.g. a single app or sub-scope).
  const streams = [params.scopeStreamId || NS_APPS];
  const limit = params.limit || 1000;
  const events = await conn.apiOne('events.get', {
    streams,
    types: [ET_ACCEPT],
    limit
  }, 'events');
  return events.map(function (event) {
    const c = (event && event.content) || {};
    return {
      acceptEventId: event.id,
      counterparty: c.from || c.acceptedBy || null,
      dataGrantAccessId: c.dataGrantAccessId || null,
      backChannelAccessId: c.backChannelAccessId || null,
      appCode: c.appCode || null,
      scopeStreamId: (event.streamIds && event.streamIds[0]) || event.streamId,
      acceptedAt: c.acceptedAt || event.time || null,
      features: c.features || (c.extra ? { chat: !!c.extra.chat, system: !!c.extra.systemMessaging } : { chat: false, system: false })
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
 * `{ scopeRequestEventId, accept: true }`. Server-side plugin runs
 * `accesses.update` on the local data-grant.
 *
 * @param {Object} conn
 * @param {string} scopeRequestEventId
 * @param {Object} [opts]
 * @param {string} [opts.scopeStreamId]   - own collector stream (defaults to the request's stream)
 * @returns {Promise<{updateAcceptEventId:string, newDataGrantAccessId:string|null}>}
 */
async function acceptScopeUpdate (conn, scopeRequestEventId, opts) {
  opts = opts || {};
  const scopeStreamId = opts.scopeStreamId || await resolveScopeRequestStream(conn, scopeRequestEventId);
  const event = await conn.apiOne('events.create', {
    streamIds: [scopeStreamId],
    type: ET_SCOPE_UPDATE,
    content: { scopeRequestEventId, accept: true }
  }, 'event');
  return {
    updateAcceptEventId: event.id,
    newDataGrantAccessId: (event.content && event.content.newAccessId) || null
  };
}

/**
 * Refuse a scope-update proposal.
 *
 * @param {Object} conn
 * @param {string} scopeRequestEventId
 * @param {Object} [opts]
 * @param {string} [opts.scopeStreamId]
 * @param {Object} [opts.reason]
 * @returns {Promise<{updateRefuseEventId:string}>}
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
  return { updateRefuseEventId: event.id };
}

async function resolveScopeRequestStream (conn, scopeRequestEventId) {
  const ev = await conn.apiOne('events.getOne', { id: scopeRequestEventId }, 'event');
  return (ev.streamIds && ev.streamIds[0]) || ev.streamId;
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
  revokeRelationship,
  invalidateCapability,
  requestScopeUpdate,
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
  // observation scopes
  scopes
};
