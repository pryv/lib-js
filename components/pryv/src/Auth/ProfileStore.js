/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * The accounts a sign-in button remembers for one app, as stored in its
 * authorization data:
 * `{ apiEndpoint, username, actingAs?, authUrl?, platform?, profiles: [...] }`.
 * The top-level `apiEndpoint` / `username` are the active account (what
 * versions without profiles read); `profiles` lists every remembered
 * account, most recently used first, the active one included.
 * A profile is `{ username, apiEndpoint, actingAs?, unavailable?,
 * permissionsFingerprint? }`, where `actingAs = { username, delegate }` marks
 * an account used through account delegation (`delegate` is the username of
 * the person acting), and `permissionsFingerprint` identifies the requested
 * permissions of the sign-in that stored it (see permissionsCoverage).
 * `platform` is the platform the sign-ins were made on (see `platformOf`);
 * absent when an earlier version stored them.
 * @memberof pryv.Auth
 */
module.exports = {
  DEFAULT_LIMIT: 5,
  read,
  write,
  activate,
  remove,
  markUnavailable,
  profileOf,
  fromAccepted,
  carriesToken,
  platformOf,
  normalizedUrl,
  forPlatform
};

const utils = require('../utils');

/**
 * Whether an apiEndpoint carries a token. A stored sign-in without one
 * cannot call the API (3.13.0 saved such sign-ins after a redirect return,
 * the credential hand-off not being redeemed).
 * @param {string} apiEndpoint
 * @returns {boolean}
 */
function carriesToken (apiEndpoint) {
  try {
    return Boolean(utils.extractTokenAndAPIEndpoint(apiEndpoint).token);
  } catch (e) {
    return false;
  }
}

/**
 * The identity of the platform of `service`: the service information URL the
 * app gave. Nothing of the service information itself is an identity: a
 * foreign document can claim any of it. Without a URL (inline service
 * information, the app's own), its `access`.
 * @param {Object} service
 * @returns {string}
 */
function platformOf (service) {
  const url = service?._serviceInfoUrl;
  if (typeof url === 'string' && url !== '') return normalizedUrl(url);
  return 'inline:' + (service?.infoSync?.()?.access ?? '');
}

/**
 * `url` in one spelling, without its fragment. Only what cannot change the
 * resource it names: path, trailing slash and query are kept.
 * @param {string} url
 * @returns {string}
 */
function normalizedUrl (url) {
  try {
    const normalized = new URL(url, globalThis.location?.href);
    normalized.hash = '';
    return normalized.href;
  } catch (e) {
    return url;
  }
}

/**
 * The stored data when it belongs to `platform`, else null. Data stored by an
 * earlier version names no platform: it belongs to it when `adoptUnbound`.
 * @param {Object|null|undefined} stored
 * @param {string} platform
 * @param {boolean} adoptUnbound
 */
function forPlatform (stored, platform, adoptUnbound) {
  if (stored == null || typeof stored !== 'object') return null;
  if (typeof stored.platform === 'string') return stored.platform === platform ? stored : null;
  return adoptUnbound ? stored : null;
}

/**
 * Parse stored authorization data (any version) into
 * `{ active, profiles, authUrl, platform? }`; `active` is `profiles[0]` or null.
 * @param {Object|null|undefined} stored
 */
function read (stored) {
  const store = { active: null, profiles: [], authUrl: undefined };
  if (stored == null || typeof stored !== 'object' || stored.deleted === true) return store;
  if (typeof stored.authUrl === 'string') store.authUrl = stored.authUrl;
  if (typeof stored.platform === 'string') store.platform = stored.platform;
  if (Array.isArray(stored.profiles)) {
    store.profiles = stored.profiles.filter(isProfile).map(profileOf);
  }
  if (isProfile(stored)) {
    const active = profileOf(stored);
    store.profiles = [active].concat(store.profiles.filter((p) => p.username !== active.username));
    store.active = active;
  }
  return store;
}

/**
 * The authorization data to store for `store`.
 * @returns {Object|null} null when nothing is left to remember
 */
function write (store) {
  if (store.profiles.length === 0) return null;
  const data = {};
  if (store.active != null) {
    data.apiEndpoint = store.active.apiEndpoint;
    data.username = store.active.username;
    if (store.active.actingAs != null) data.actingAs = store.active.actingAs;
    if (store.active.permissionsFingerprint != null) data.permissionsFingerprint = store.active.permissionsFingerprint;
  }
  if (store.authUrl != null) data.authUrl = store.authUrl;
  if (store.platform != null) data.platform = store.platform;
  data.profiles = store.profiles.map(profileOf);
  return data;
}

/**
 * Make `profile` the active account (replacing a stored one with the same
 * username), then forget the least recently used accounts beyond `limit`.
 */
function activate (store, profile, limit) {
  const max = Math.max(1, limit || module.exports.DEFAULT_LIMIT);
  const active = profileOf(profile);
  const profiles = [active].concat(store.profiles.filter((p) => p.username !== active.username));
  return Object.assign({}, store, { active, profiles: profiles.slice(0, max) });
}

/** Forget `username`; forgetting the active account leaves none active. */
function remove (store, username) {
  const profiles = store.profiles.filter((p) => p.username !== username);
  const active = (store.active != null && store.active.username !== username) ? store.active : null;
  return Object.assign({}, store, { active, profiles });
}

/** Keep `username` listed, marked as no longer usable (revoked, detached). */
function markUnavailable (store, username) {
  const mark = (p) => (p.username === username ? Object.assign(profileOf(p), { unavailable: true }) : p);
  const profiles = store.profiles.map(mark);
  const active = (store.active != null && store.active.username === username) ? null : store.active;
  return Object.assign({}, store, { active, profiles });
}

/** The stored fields of a profile, nothing else (credentials included). */
function profileOf (p) {
  const profile = { username: p.username, apiEndpoint: p.apiEndpoint };
  if (p.actingAs != null && typeof p.actingAs.delegate === 'string') {
    profile.actingAs = { username: p.username, delegate: p.actingAs.delegate };
  }
  if (p.unavailable === true) profile.unavailable = true;
  if (typeof p.permissionsFingerprint === 'string') profile.permissionsFingerprint = p.permissionsFingerprint;
  return profile;
}

function isProfile (p) {
  return p != null && typeof p.username === 'string' && typeof p.apiEndpoint === 'string';
}

/**
 * The profile of an ACCEPTED auth-request body. Its `delegation` block is a
 * display hint posted by the auth page; `accessInfo().delegation` is
 * authoritative and replaces it when the profile is next activated.
 * @param {Object} body
 * @param {string} [permissionsFingerprint] - of the request this sign-in answered
 */
function fromAccepted (body, permissionsFingerprint) {
  const profile = { username: body.username, apiEndpoint: body.apiEndpoint };
  if (typeof permissionsFingerprint === 'string') profile.permissionsFingerprint = permissionsFingerprint;
  const d = body.delegation;
  if (d != null && d.isDelegatedAccess === true && d.controlledUsername === body.username &&
      typeof d.delegate?.username === 'string') {
    profile.actingAs = { username: body.username, delegate: d.delegate.username };
  }
  return profile;
}
