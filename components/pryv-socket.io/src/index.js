/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const SocketIO = require('./SocketIO');

/**
 * Load Socket.IO capabilities onto `pryv`
 * @param {pryv} pryv `pryv` library @see https://github.com/pryv/lib-js
 */
module.exports = function (pryv) {
  console.log('"pryv" lib version', pryv.version);
  // check version here
  if (pryv.Connection.SocketIO) {
    throw new Error('Socket.IO add-on already loaded');
  }
  // sharing cross references
  pryv.Connection.SocketIO = SocketIO;
  SocketIO(pryv.Connection);
};
