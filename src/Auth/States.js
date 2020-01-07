/** @module Pryv.Auth */
/**
 * Error Status code, data: {message: string, error: Error}
 * @static
 */
exports.ERROR = 'error';
/**
* Internal state
* @static
*/
exports.INIT = 'init';
/**
* When it's time to propose login, data: {info: ServiceInfo}
* @static
*/
exports.PROPOSE_LOGIN = 'propose'; // internal
/**
* Connection succed, data: {info: ServiceInfo}
* @static
*/
exports.AUTHORIZED = 'loggedIn';
exports.REFUSED = 'refused';
exports.OPENURL = 'openURL'; 