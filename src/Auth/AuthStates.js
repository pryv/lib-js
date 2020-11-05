

/**
 * Enum Possible states: ERROR, LOADING, INITIALIZED, AUTHORIZED, SIGNOUT
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
  SIGNOUT: 'SIGNOUT',
  REFUSED: 'REFUSED',
} 


module.exports = AuthState 
