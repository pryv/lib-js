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

function cacheSet (key, value) {
  if (key == null) return;
  cache.set(key, Object.assign({}, value, { expiresAt: Date.now() + TTL_MS }));
}

/** Drop one entry (sign-out), or everything when called with no key. */
function cacheClear (key) {
  if (key == null) cache.clear();
  else cache.delete(key);
}

/** Does an ACCEPTED poll body deliver by shared-secret hand-off? */
function isHandoffBody (body) {
  return body != null && body.handoff != null && typeof body.handoff.key === 'string';
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

  let result;
  try {
    result = await SharedSecrets.retrieve(pollBody.apiEndpoint, pollBody.handoff.key);
  } catch (err) {
    const pe = new PryvError(
      'Credential hand-off could not be retrieved (' +
        (err && (err.id || err.message)) + '); restart the auth request.',
      err
    );
    // Prefer the machine id the retrieve refusal carries in `data.id`
    // (`shared-secret-unavailable`) over the coarse HTTP id.
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
