/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * CMC (Cross-account Messaging & Consent) client-side helpers.
 *
 * Mirrors the server plugin's slug + stream-id helpers so app code can
 * build stream-ids deterministically without depending on the server's
 * private modules. See server-side `components/cmc/src/{slug,constants}.ts`.
 *
 * Stream-id model:
 *   :_cmc:                                  reserved root
 *   :_cmc:inbox                             one-shot lifecycle (cross-app)
 *   :_cmc:apps:<app-code>:[<path>:]chats:<counterparty-slug>
 *   :_cmc:apps:<app-code>:[<path>:]collectors:<counterparty-slug>
 *
 * `counterparty-slug` = `<username>--<host-slug>` where host-slug is the
 * host with `.` replaced by `-`.
 *
 * @memberof pryv
 * @namespace pryv.cmc
 */

// --- Constants ---
const NS = ':_cmc:';
const NS_INBOX = ':_cmc:inbox';
const NS_APPS = ':_cmc:apps';
const NS_INTERNAL = ':_cmc:_internal';
const NS_INTERNAL_RETRIES = ':_cmc:_internal:retries';

const ET_REQUEST = 'cmc/request-v1';
const ET_ACCEPT = 'cmc/accept-v1';
const ET_REFUSE = 'cmc/refuse-v1';
const ET_REVOKE = 'cmc/revoke-v1';
const ET_CHAT = 'cmc/chat-v1';
const ET_SYSTEM_ALERT = 'cmc/system-alert-v1';
const ET_SYSTEM_ACK = 'cmc/system-ack-v1';
const ET_SYSTEM_SCOPE_REQUEST = 'cmc/system-scope-request-v1';
const ET_SYSTEM_SCOPE_UPDATE = 'cmc/system-scope-update-v1';

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
  return host.toLowerCase().replace(/\./g, '-');
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

module.exports = {
  // namespace constants
  NS,
  NS_INBOX,
  NS_APPS,
  NS_INTERNAL,
  NS_INTERNAL_RETRIES,
  // event types
  ET_REQUEST,
  ET_ACCEPT,
  ET_REFUSE,
  ET_REVOKE,
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
  parseCollectorStreamId
};
