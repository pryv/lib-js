/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Custom error class for Pryv library errors.
 *
 * Two construction patterns are supported (additive — both stay valid):
 *
 *   // Legacy: wrap an underlying error or value
 *   throw new PryvError('Failed to do X', innerError)
 *
 *   // Structured: carry the API error id, HTTP status, and raw response
 *   throw PryvError.fromApiResponse(response, body)
 *
 * Structured fields (`id`, `status`, `response`) are `undefined` unless set
 * via the static factory or assigned post-hoc.
 *
 * @extends Error
 */
class PryvError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Error|Object} [innerObject] - Underlying error or value
   */
  constructor (message, innerObject) {
    super(message);
    this.name = 'PryvError';
    /** @type {Error|Object|undefined} */
    this.innerObject = innerObject;
    /** @type {string|undefined} Pryv API error id, e.g. `'unknown-user'` */
    this.id = undefined;
    /** @type {number|undefined} HTTP status that produced this error */
    this.status = undefined;
    /** @type {{ body: any, status: number }|undefined} Raw response */
    this.response = undefined;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PryvError);
    }
  }

  /**
   * Build a PryvError from a fetch Response and its parsed JSON body.
   * Pulls `id` and `message` from `body.error` when present (Pryv API shape).
   *
   * @param {Response} response - The fetch Response object
   * @param {Object} [body] - Parsed JSON body
   * @returns {PryvError}
   */
  static fromApiResponse (response, body) {
    const apiErr = body && body.error;
    const message = (apiErr && apiErr.message) ||
      `Pryv API error (HTTP ${response.status})`;
    const err = new PryvError(message);
    err.id = apiErr && apiErr.id;
    err.status = response.status;
    err.response = { body, status: response.status };
    return err;
  }
}

module.exports = PryvError;
