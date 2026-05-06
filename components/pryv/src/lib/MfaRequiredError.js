/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

const PryvError = require('./PryvError');

/**
 * Thrown by `Service.login` when the platform replied with `{ mfaToken }`
 * instead of `{ token }`. Consumers catch this, prompt the user for the
 * SMS code, then call `Service.mfaVerify(userId, err.mfaToken, code)`.
 *
 *   try { conn = await service.login(u, p, app) }
 *   catch (err) {
 *     if (err instanceof MfaRequiredError) {
 *       const code = await prompt()
 *       conn = await service.mfaVerify(u, err.mfaToken, code)
 *     } else { throw err }
 *   }
 *
 * @extends PryvError
 */
class MfaRequiredError extends PryvError {
  /**
   * @param {string} mfaToken - The token returned by the API (use with mfa.challenge / mfa.verify)
   * @param {Response} response - The fetch Response object
   * @param {Object} [body] - Parsed JSON body
   */
  constructor (mfaToken, response, body) {
    const apiErr = body && body.error;
    const message = (apiErr && apiErr.message) || 'MFA required';
    super(message);
    this.name = 'MfaRequiredError';
    /** @type {string} */
    this.mfaToken = mfaToken;
    this.id = (apiErr && apiErr.id) || 'mfa-required';
    this.status = response && response.status;
    this.response = { body, status: response && response.status };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MfaRequiredError);
    }
  }
}

module.exports = MfaRequiredError;
