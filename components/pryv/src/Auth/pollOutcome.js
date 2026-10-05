/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const AuthStates = require('./AuthStates');

/**
 * States built from the answer to an auth-request poll, shared by the popup
 * (AuthController) and the redirect (LoginButton) paths so both emit the
 * same shapes.
 */
module.exports = {
  refusedState,
  unreadableAnswerState
};

/**
 * The REFUSED state for a refused auth request: the core's `reasonId`
 * (e.g. `REFUSED_BY_USER`, `REFUSED_MANDATORY_CONSENT`) and `message`, with
 * the service info. Nothing else of the answer is kept.
 * @param {Object} body - the poll answer (`status: 'REFUSED'`)
 * @param {Object} [serviceInfo]
 * @returns {Object}
 */
function refusedState (body, serviceInfo) {
  return { status: AuthStates.REFUSED, reasonId: body?.reasonId, message: body?.message, serviceInfo };
}

/**
 * The ERROR state for a poll answer without a `status` (unknown or expired
 * key, a server error body, no body): nothing the sign-in button can show.
 * @param {Object} [body] - the poll answer
 * @returns {Object}
 */
function unreadableAnswerState (body) {
  return { status: AuthStates.ERROR, message: 'Cannot fetch result', error: body?.error ?? body };
}
