/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Resolve a content-query dot-path against a JSON value.
 * `$` addresses the root value itself. Returns `undefined` when the path
 * does not lead to a value.
 * @param {*} root - The JSON value (typically an event's `content`)
 * @param {string} path - Dot-path (e.g. 'drug.codes.atc') or '$'
 * @returns {*} The value at the path, or undefined
 */
function resolveDotPath (root, path) {
  if (path === '$') return root;
  let current = root;
  for (const segment of path.split('.')) {
    if (current == null || typeof current !== 'object' || Array.isArray(current)) return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

module.exports = resolveDotPath;
