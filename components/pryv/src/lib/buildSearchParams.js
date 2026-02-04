/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Build URL search params string from an object, properly handling arrays.
 * Arrays are expanded as repeated keys: { a: ['x', 'y'] } => 'a=x&a=y'
 * @param {Object} params - Query parameters object
 * @returns {string} - URL encoded query string
 */
function buildSearchParams (params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
  return searchParams.toString();
}

module.exports = buildSearchParams;
