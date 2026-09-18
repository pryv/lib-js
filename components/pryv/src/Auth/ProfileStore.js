/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * The accounts a sign-in button remembers for one app, as stored in its
 * authorization data:
 * `{ apiEndpoint, username, actingAs?, authUrl?, profiles: [...] }`.
 * The top-level `apiEndpoint` / `username` are the active account (what
 * versions without profiles read); `profiles` lists every remembered
 * account, most recently used first, the active one included.
 * A profile is `{ username, apiEndpoint, actingAs?, unavailable? }`, where
 * `actingAs = { username, delegate }` marks an account used through account
 * delegation (`delegate` is the username of the person acting).
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
  fromAccepted
};

/**
 * Parse stored authorization data (any version) into
 * `{ active, profiles, authUrl }`; `active` is `profiles[0]` or null.
 * @param {Object|null|undefined} stored
 */
function read (stored) {
  const store = { active: null, profiles: [], authUrl: undefined };
  if (stored == null || typeof stored !== 'object' || stored.deleted === true) return store;
  if (typeof stored.authUrl === 'string') store.authUrl = stored.authUrl;
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
  }
  if (store.authUrl != null) data.authUrl = store.authUrl;
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
  return profile;
}

function isProfile (p) {
  return p != null && typeof p.username === 'string' && typeof p.apiEndpoint === 'string';
}

/**
 * The profile of an ACCEPTED auth-request body. Its `delegation` block is a
 * display hint posted by the auth page; `accessInfo().delegation` is
 * authoritative and replaces it when the profile is next activated.
 */
function fromAccepted (body) {
  const profile = { username: body.username, apiEndpoint: body.apiEndpoint };
  const d = body.delegation;
  if (d != null && d.isDelegatedAccess === true && d.controlledUsername === body.username &&
      typeof d.delegate?.username === 'string') {
    profile.actingAs = { username: body.username, delegate: d.delegate.username };
  }
  return profile;
}
