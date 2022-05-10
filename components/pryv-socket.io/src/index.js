/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const SocketIO = require('./SocketIO');

/**
 * Load SocketIO capabilities onto Pryv
 * @param {Pryv} Pryv - Pryv lib-js library @see https://github.com/pryv/lib-js
 */
module.exports = function (Pryv) {
  console.log('lib-js version', Pryv.version);
  // check version here
  if (Pryv.Connection.SocketIO) {
    throw new Error('SocketIO already loaded');
  }
  // sharing cross references
  Pryv.Connection.SocketIO = SocketIO;
  SocketIO(Pryv.Connection);
};
