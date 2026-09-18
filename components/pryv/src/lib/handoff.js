/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Credential hand-off (shared-secret delivery) support for the auth-request
 * flow.
 *
 * When an access request set `credentialHandoff: 'shared-secret'`, the ACCEPTED
 * poll body carries a one-time `handoff.key` and a token-less `apiEndpoint`
 * instead of the token. This module redeems that key ONCE against the user's
 * core (`shared-secrets/retrieve`, no credentials needed) and turns the result
 * into a token-bearing apiEndpoint the rest of the library already understands.
 *
 * A module-level cache keyed by the auth-flow poll key holds the result for a
 * short TTL: `pryv.connectFromKey(key, ...)` builds a fresh `Service` on every
 * call and the `AuthController` polling loop also reads the ACCEPTED body, so
 * without a shared cache the one-shot secret would be redeemed twice and the
 * second read would fail. Whoever redeems first fills the cache; the others
 * reuse it.
 */

const utils = require('../utils');
const SharedSecrets = require('../SharedSecrets');
const PryvError = require('./PryvError');

/** How long a redeemed credential stays cached (10 min, or until sign-out). */
const TTL_MS = 10 * 60 * 1000;

/** poll key -> { apiEndpoint, username, token, expiresAt } */
const cache = new Map();
/** poll key -> Promise, so concurrent resolves for one key redeem once. */
const inflight = new Map();

function cacheGet (key) {
  if (key == null) return null;
  const entry = cache.get(key);
  if (entry == null) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry;
}

/** Drop expired entries so cached tokens do not linger for the process
 * lifetime in a long-running Node service (a browser page is short-lived, but
 * the same module runs server-side too). Called on every set; the map holds
 * one entry per in-flight sign-in, so the scan is trivially small. */
function sweep () {
  const now = Date.now();
  for (const [k, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(k);
  }
}

function cacheSet (key, value) {
  if (key == null) return;
  sweep();
  cache.set(key, Object.assign({}, value, { expiresAt: Date.now() + TTL_MS }));
}

/** Drop one entry (sign-out). Passing no key is an explicit clear-all. */
function cacheClear (key) {
  if (arguments.length === 0) cache.clear();
  else cache.delete(key);
}

/** Does an ACCEPTED poll body deliver by shared-secret hand-off? */
function isHandoffBody (body) {
  return body != null && body.handoff != null &&
    body.handoff.type === 'shared-secret' && typeof body.handoff.key === 'string';
}

/**
 * Redeem a hand-off poll body into a token-bearing apiEndpoint, caching the
 * result under `cacheKey`. Throws a `PryvError` (id `credential-handoff-failed`)
 * telling the caller to restart the auth request when the one-time secret is
 * gone (already redeemed, expired) or the retrieve fails.
 *
 * @param {Object} pollBody an ACCEPTED body carrying `apiEndpoint` + `handoff.key`
 * @param {string} [cacheKey] the auth-flow poll key, so a repeat resolve reuses this
 * @returns {Promise<{ apiEndpoint: string, username: string, token: string }>}
 */
async function resolveHandoff (pollBody, cacheKey) {
  const cached = cacheGet(cacheKey);
  if (cached != null) return cached;
  // De-duplicate concurrent redemptions of the same key (e.g. React
  // StrictMode double-invoking an effect that calls connectFromKey twice):
  // both would otherwise miss the cache and the second would 403 the
  // already-consumed one-time secret.
  if (cacheKey != null && inflight.has(cacheKey)) return inflight.get(cacheKey);

  const promise = doResolve(pollBody, cacheKey);
  if (cacheKey == null) return promise;
  inflight.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(cacheKey);
  }
}

async function doResolve (pollBody, cacheKey) {
  let result;
  try {
    result = await SharedSecrets.retrieve(pollBody.apiEndpoint, pollBody.handoff.key);
  } catch (err) {
    const pe = new PryvError(
      'Credential hand-off could not be retrieved (' +
        (err && (err.id || err.message)) + '); restart the auth request.',
      err
    );
    // Stable id for callers that branch on the hand-off failure; the finer
    // reason (`shared-secret-unavailable`) rides on `innerObject.id`, which
    // `SharedSecrets.retrieve` now takes from the refusal's `data.id`.
    pe.id = 'credential-handoff-failed';
    throw pe;
  }

  const secret = (result && result.secret) || {};
  if (typeof secret.token !== 'string' || typeof secret.apiEndpoint !== 'string') {
    const pe = new PryvError('Credential hand-off returned an incomplete secret.');
    pe.id = 'credential-handoff-failed';
    throw pe;
  }

  // The secret's apiEndpoint may be token-less or token-bearing; rebuild a
  // canonical token-bearing endpoint from the authoritative `token` so the
  // rest of the library (Connection, the LoginButton cookie) is unchanged.
  const { endpoint } = utils.extractTokenAndAPIEndpoint(secret.apiEndpoint);
  const apiEndpoint = utils.buildAPIEndpoint({ endpoint, token: secret.token });
  const entry = { apiEndpoint, username: secret.username, token: secret.token };
  cacheSet(cacheKey, entry);
  return entry;
}

module.exports = { resolveHandoff, isHandoffBody, cacheGet, cacheSet, cacheClear };
