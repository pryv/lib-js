/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

const PryvError = require('./PryvError');

/**
 * Plan 66: typed error surfaced when a Pryv.io server (≥ 2.0.0-pre.X)
 * rejects an `accesses.update` or `accesses.delete` call with a
 * 409 `stale-resource` response.
 *
 * The composite access id `<base>:<serial>` carries the version the
 * caller last observed. If the access has since been updated, the
 * server rejects the call so the caller refetches the current head
 * (`connection.api('accesses.getOne', { id: base })`) and retries
 * with the fresh composite id.
 *
 * Reach for `.data.provided` to see what the caller sent and
 * `.data.currentSerial` to see what the server currently has.
 *
 * @extends PryvError
 */
class StaleAccessIdError extends PryvError {
  /**
   * @param {string} message
   * @param {{ provided?: string, currentSerial?: number | null }} data
   */
  constructor (message, data) {
    super(message);
    this.name = 'StaleAccessIdError';
    /** @type {{ provided?: string, currentSerial?: number | null }} */
    this.data = data || {};
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaleAccessIdError);
    }
  }
}

module.exports = StaleAccessIdError;
