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
 */

/** Most entries kept (oldest dropped first): one per sign-in in progress. */
const MAX_ENTRIES = 100;

/** key -> poll URL, in insertion order */
const pollUrls = new Map();

/**
 * Remember the poll URL of an auth request (ignored unless both look valid).
 * @param {string} key
 * @param {string} pollUrl
 */
function remember (key, pollUrl) {
  if (typeof key !== 'string' || key === '' || typeof pollUrl !== 'string' || !/^https?:\/\//.test(pollUrl)) return;
  pollUrls.delete(key);
  pollUrls.set(key, pollUrl);
  while (pollUrls.size > MAX_ENTRIES) pollUrls.delete(pollUrls.keys().next().value);
}

/**
 * The server-issued poll URL of `key`, or null when this process did not
 * start that request.
 * @param {string} key
 * @returns {string|null}
 */
function lookup (key) {
  return pollUrls.get(key) ?? null;
}

module.exports = { remember, lookup, MAX_ENTRIES };
