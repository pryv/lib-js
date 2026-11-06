/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Whether an access covers the stream permissions an app requests, and a
 * fingerprint of a request, kept with a stored sign-in to know which request
 * it was made for.
 * @memberof pryv.Auth
 */
module.exports = {
  missingPermissions,
  permissionsFingerprint
};

/** The granted levels that cover each requested level. */
const COVERED_BY = {
  read: ['read', 'contribute', 'manage'],
  'create-only': ['create-only', 'contribute', 'manage'],
  contribute: ['contribute', 'manage'],
  manage: ['manage']
};

/**
 * The requested stream permissions the access does not cover (an empty
 * array when it covers them all).
 *
 * A requested permission is covered by a permission of the access on the
 * same `streamId`, or on `'*'`, with at least the requested level:
 * `read` < `contribute` < `manage`; `create-only` is covered by
 * `create-only`, `contribute` and `manage` (not by `read`); a requested
 * `none` needs nothing. A permission on a parent stream does NOT cover a
 * child stream (the stream ids are compared as they are). Feature
 * permissions (`{ feature, setting }`) are ignored on both sides. A personal
 * access covers everything.
 *
 * @param {Array<Object>} requestedPermissions - e.g. `authRequest.requestedPermissions`
 * @param {Object} accessInfo - the access, as `connection.accessInfo()` returns it (`type`, `permissions`)
 * @returns {Array<Object>} the uncovered requested permissions, as requested
 */
function missingPermissions (requestedPermissions, accessInfo) {
  const requested = streamPermissions(requestedPermissions).filter((p) => p.level !== 'none');
  if (accessInfo?.type === 'personal') return [];
  const granted = streamPermissions(accessInfo?.permissions);
  return requested
    .filter((r) => !granted.some((g) => (g.streamId === r.streamId || g.streamId === '*') && covers(g.level, r.level)))
    .map((r) => Object.assign({}, r));
}

/**
 * A short stable fingerprint of the stream permissions of a request: the
 * same for the same `streamId` + `level` pairs in any order; other fields
 * (`defaultName`, ...) and feature permissions are ignored.
 * @param {Array<Object>} requestedPermissions
 * @returns {string} 8 hexadecimal characters
 */
function permissionsFingerprint (requestedPermissions) {
  const entries = streamPermissions(requestedPermissions)
    .map((p) => JSON.stringify([p.streamId, p.level]))
    .sort();
  return fnv1a(entries.join(','));
}

function covers (grantedLevel, requestedLevel) {
  const coveredBy = COVERED_BY[requestedLevel] ?? [requestedLevel];
  return coveredBy.includes(grantedLevel);
}

/** The stream permissions of a list (feature permissions left out). */
function streamPermissions (permissions) {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p) => p != null && typeof p === 'object' && p.feature == null && typeof p.streamId === 'string');
}

/** 32-bit FNV-1a hash of a string, as 8 hex characters. */
function fnv1a (str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
