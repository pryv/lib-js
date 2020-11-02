

/**
 * Enum Possible states: ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 * @readonly
 * @enum {string}
 * @memberof Pryv.Browser
 */
const AuthState = {
  ERROR : 'ERROR',
  LOADING : 'LOADING',
  INITIALIZED: 'INITIALIZED',
  NEED_SIGNIN: 'NEED_SIGNIN',
  AUTHORIZED: 'ACCEPTED',
  LOGOUT: 'LOGOUT',
  REFUSED: 'REFUSED',
} 


module.exports = AuthState 
