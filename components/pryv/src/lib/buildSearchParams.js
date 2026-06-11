/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Build URL search params string from an object, properly handling arrays
 * and structured values.
 * - Arrays of scalars are expanded as repeated keys: { a: ['x', 'y'] } => 'a=x&a=y'
 * - Arrays containing objects (e.g. `content` / `clientData` conditions,
 *   rich `streams` queries) and plain objects are sent as one
 *   JSON-encoded parameter, which the API parses back.
 * @param {Object} params - Query parameters object
 * @returns {string} - URL encoded query string
 */
function buildSearchParams (params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      if (value.some((item) => item !== null && typeof item === 'object')) {
        searchParams.append(key, JSON.stringify(value));
      } else {
        for (const item of value) {
          searchParams.append(key, item);
        }
      }
    } else if (value !== null && typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
  return searchParams.toString();
}

module.exports = buildSearchParams;
