/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * The poll URL the server issued for each auth request started in this
 * process, by key.
 *
 * A pending auth request lives on the core that created it, and its poll URL
 * points at that core. The service's `access` URL may reach any core of a
 * multi-core platform, so polling `access + key` can land on a core that does
 * not know the request. Polling by key therefore uses the server-issued URL
 * when this process started the request, and falls back to `access + key`
 * only for a key it never saw.
 *
 * Keys are long random server values, so one process-wide map (like the
 * hand-off cache) serves every Service.
 */

/** Most entries kept (oldest dropped first), sized for a busy Node service. */
const MAX_ENTRIES = 1000;
/** How long an entry is kept: well beyond any auth request's lifetime. */
const TTL_MS = 60 * 60 * 1000;

/** key -> { pollUrl, expiresAt }, in insertion order */
const pollUrls = new Map();

/** Drop expired entries (called on every remember). */
function sweep () {
  const now = Date.now();
  for (const [key, entry] of pollUrls) {
    if (now > entry.expiresAt) pollUrls.delete(key);
  }
}

/**
 * Remember the poll URL of an auth request (ignored unless both look valid).
 * @param {string} key
 * @param {string} pollUrl
 */
function remember (key, pollUrl) {
  if (typeof key !== 'string' || key === '' || typeof pollUrl !== 'string' || !/^https?:\/\//.test(pollUrl)) return;
  sweep();
  pollUrls.delete(key);
  pollUrls.set(key, { pollUrl, expiresAt: Date.now() + TTL_MS });
  while (pollUrls.size > MAX_ENTRIES) pollUrls.delete(pollUrls.keys().next().value);
}

/**
 * The server-issued poll URL of `key`, or null when this process did not
 * start that request (or it expired).
 * @param {string} key
 * @returns {string|null}
 */
function lookup (key) {
  const entry = pollUrls.get(key);
  if (entry == null) return null;
  if (Date.now() > entry.expiresAt) {
    pollUrls.delete(key);
    return null;
  }
  return entry.pollUrl;
}

/** Forget every entry. */
function clear () {
  pollUrls.clear();
}

module.exports = { remember, lookup, clear, MAX_ENTRIES, TTL_MS };
