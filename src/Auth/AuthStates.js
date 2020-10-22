

/**
 * Enum Possible states: ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 * @readonly
 * @enum {string}
 * @memberof Pryv.Browser
 */
const AuthState = {
  ERROR : 'error',
  LOADING : 'loading',
  INITIALIZED: 'initialized',
  AUTHORIZED: 'authorized',
  LOGOUT: 'logout'
} 


module.exports = AuthState 
