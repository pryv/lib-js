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
const ET_CHAT = 'message/chat-cmc';
const ET_SYSTEM_ALERT = 'notification/alert-cmc';
const ET_SYSTEM_ACK = 'notification/ack-cmc';
const ET_SYSTEM_SCOPE_REQUEST = 'consent/scope-request-cmc';
const ET_SYSTEM_SCOPE_UPDATE = 'consent/scope-update-cmc';

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

// --- Actor helpers (apiEndpoint → { token, username, host }) ---

/**
 * Extract `{ token, username, host }` from a Pryv apiEndpoint, given
 * the platform's `service.info.api` URL template.
 *
 * Pryv apiEndpoints follow one of two URL shapes (the difference is
 * platform-defined, encoded in `service.info.api`):
 *
 *   subdomain  template `https://{username}.<domain>/`
 *              endpoint `https://<token>@<username>.<domain>/`
 *   path-style template `https://<host>/{username}/`
 *              endpoint `https://<token>@<host>/<username>/`
 *
 * This helper inverts whichever template the platform serves, returning
 * the **canonical host** (no `<username>.` subdomain prefix in subdomain
 * mode) — that's the host CMC uses for cross-account identity (slugs,
 * counterparty matching).
 *
 * @param {string} apiEndpoint  e.g. 'https://t0k3n@alice.pryv.me/'
 * @param {string} serviceInfoApi  e.g. 'https://{username}.pryv.me/'
 *                                 from /service/info → field `api`.
 * @returns {{ token: string|null, username: string|null, host: string }}
 *
 * @example
 *   const conn = new pryv.Connection(apiEndpoint);
 *   const info = await conn.service.info();
 *   const me = pryv.cmc.extractActor(apiEndpoint, info.api);
 *   // → { token: 't0k3n', username: 'alice', host: 'pryv.me' }
 */
function extractActor (apiEndpoint, serviceInfoApi) {
  // Avoid circular require: utils is the consumer, cmc the provider.
  // We pull at call-time so cmc.js stays loadable without requiring
  // utils early.
  const utils = require('./utils');
  const { token, endpoint } = utils.extractTokenAndAPIEndpoint(apiEndpoint);
  // Match the api template's variable position to find the username.
  // Both endpoint + template are guaranteed to have a trailing slash.
  const tplIdx = serviceInfoApi.indexOf('{username}');
  if (tplIdx < 0) {
    // Template doesn't carry {username} — operator-defined, can't decompose.
    let host = '';
    try { host = new URL(endpoint).host; } catch (_e) {}
    return { token, username: null, host };
  }
  const tplPrefix = serviceInfoApi.slice(0, tplIdx);
  const tplSuffix = serviceInfoApi.slice(tplIdx + '{username}'.length);
  if (!endpoint.startsWith(tplPrefix) || !endpoint.endsWith(tplSuffix)) {
    let host = '';
    try { host = new URL(endpoint).host; } catch (_e) {}
    return { token, username: null, host };
  }
  const username = endpoint.slice(tplPrefix.length, endpoint.length - tplSuffix.length);
  // For subdomain templates, host is `<username>.<domain>` — but the
  // canonical CMC host is the bare `<domain>` (the platform identity,
  // not per-user). For path-style, host is just the literal host.
  // Disambiguate by where {username} sits in the template:
  //   - subdomain  → prefix ends with `://` (username right after scheme)
  //   - path-style → prefix has more after `://` (host already in prefix)
  const isSubdomainTemplate = /:\/\/$/.test(tplPrefix);
  let host;
  if (isSubdomainTemplate) {
    // tplSuffix starts with the domain (e.g. '.pryv.me/')
    host = tplSuffix.replace(/^\.+/, '').replace(/\/+$/, '');
  } else {
    // path-style — host is in the prefix's URL
    try {
      host = new URL(tplPrefix).host;
    } catch (_e) {
      host = '';
    }
  }
  return { token, username, host };
}

module.exports = {
  // namespace constants
  NS,
  NS_INBOX,
  NS_APPS,
  NS_INTERNAL,
  NS_INTERNAL_RETRIES,
  // actor helper
  extractActor,
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
