/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * `pryv` library
 * @exports pryv
 * @property {pryv.Service} Service - To interact with Pryv.io at a "Platform level"
 * @property {pryv.Connection} Connection - To interact with an individual's (user) data set
 * @property {pryv.Browser} Browser - Browser Tools - Access request helpers and visuals (button)
 * @property {pryv.OAuth2Client} OAuth2Client - Browser-side OAuth2 authorization-code (PKCE) flow consumer
 * @property {pryv.utils} utils - Exposes some utils for HTTP calls and tools to manipulate Pryv's API endpoints
 * @property {pryv.PryvError} PryvError - Custom error class with innerObject + structured API-error fields
 * @property {pryv.MfaRequiredError} MfaRequiredError - Thrown by Service.login when the platform returns an mfaToken instead of a token. Carries `.mfaToken`.
 * @property {pryv.StaleAccessIdError} StaleAccessIdError - Thrown when a Pryv.io server rejects an `accesses.update` / `accesses.delete` with a 409 stale-resource. Refetch + retry.
 * @property {Object} ERRORS - Catalogue of Pryv API error ids (mirrors open-pryv.io/components/errors)
 */
const Service = require('./Service');

module.exports = {
  Service,
  Connection: require('./Connection'),
  Auth: require('./Auth'),
  Browser: require('./Browser'),
  OAuth2Client: require('./OAuth2Client'),
  utils: require('./utils'),
  PryvError: require('./lib/PryvError'),
  MfaRequiredError: require('./lib/MfaRequiredError'),
  StaleAccessIdError: require('./lib/StaleAccessIdError'),
  ERRORS: require('./lib/errorIds'),
  version: require('../package.json').version,
  connectFromKey
};

/**
 * Module-level convenience over `Service#connectFromKey` — builds a
 * `Service` on the fly, fetches its info, and resolves the given
 * auth-flow polling key into a working `Connection`.
 *
 * Mirrors the `pryv.connectFromKey(key, serviceInfoUrl)` shape the
 * headless polling pattern documents.
 *
 * @param {string} key - polling key from `Service.startAccessRequest`
 * @param {string} serviceInfoUrl - URL of the platform's `/service/info`
 * @param {Object} [serviceCustomizations] - same shape as `new Service(url, customizations)`
 * @returns {Promise<import('./Connection')>}
 */
async function connectFromKey (key, serviceInfoUrl, serviceCustomizations) {
  const service = new Service(serviceInfoUrl, serviceCustomizations);
  await service.info();
  return service.connectFromKey(key);
}
