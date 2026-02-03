/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Custom error class for Pryv library errors.
 * Includes an innerError property for wrapping underlying errors.
 * @extends Error
 */
class PryvError extends Error {
  /**
   * Create a PryvError
   * @param {string} message - Error message
   * @param {Error|Object} [innerError] - The underlying error or object that caused this error
   */
  constructor (message, innerError) {
    super(message);
    this.name = 'PryvError';
    /** @type {Error|Object|undefined} */
    this.innerError = innerError;

    // Maintains proper stack trace for where error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PryvError);
    }
  }
}

module.exports = PryvError;
