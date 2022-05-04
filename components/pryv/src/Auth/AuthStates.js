/**
 * The possible auth states:
 * ERROR, LOADING, INITIALIZED, NEED_SIGNIN, AUTHORIZED, SIGNOUT, REFUSED
 * @readonly
 * @enum {string}
 * @memberof Pryv.Browser
 */
module.exports = {
  ERROR: 'ERROR',
  LOADING: 'LOADING',
  INITIALIZED: 'INITIALIZED',
  NEED_SIGNIN: 'NEED_SIGNIN',
  AUTHORIZED: 'ACCEPTED',
  SIGNOUT: 'SIGNOUT',
  REFUSED: 'REFUSED'
};
