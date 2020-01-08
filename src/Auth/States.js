

/**
 * Enum Possible states: ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 * @memberof Pryv.Auth
 * @readonly
 * @enum {string}
 */
const AuthState = {
  ERROR : 'error',
  LOADING : 'loading',
  INITIALIZED: 'initialized',
  AUTHORIZED: 'authorized',
  LOGOUT: 'logout'
} 


module.exports = AuthState 
