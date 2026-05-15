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
 * @property {pryv.utils} utils - Exposes some utils for HTTP calls and tools to manipulate Pryv's API endpoints
 * @property {pryv.PryvError} PryvError - Custom error class with innerObject + structured API-error fields
 * @property {pryv.MfaRequiredError} MfaRequiredError - Thrown by Service.login when the platform returns an mfaToken instead of a token. Carries `.mfaToken`.
 * @property {pryv.StaleAccessIdError} StaleAccessIdError - Plan 66: thrown when a Pryv.io server rejects an `accesses.update` / `accesses.delete` with a 409 stale-resource. Refetch + retry.
 * @property {Object} ERRORS - Catalogue of Pryv API error ids (mirrors open-pryv.io/components/errors)
 * @property {pryv.cmc} cmc - Cross-account Messaging & Consent helpers (slug + stream-id builders + parsers)
 */
module.exports = {
  Service: require('./Service'),
  Connection: require('./Connection'),
  Auth: require('./Auth'),
  Browser: require('./Browser'),
  utils: require('./utils'),
  PryvError: require('./lib/PryvError'),
  MfaRequiredError: require('./lib/MfaRequiredError'),
  StaleAccessIdError: require('./lib/StaleAccessIdError'),
  ERRORS: require('./lib/errorIds'),
  cmc: require('./cmc'),
  version: require('../package.json').version
};
