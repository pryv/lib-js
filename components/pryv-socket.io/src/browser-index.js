/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/* global pryv */

/**
 * This entry point is for Browser only
 * It extends `pryv` with Socket.IO capabilities
 */
const extendPryv = require('./index.js');
(function () {
  if (pryv == null) {
    throw new Error('"pryv" is not accessible, add <script src="https://api.pryv.com/lib-js/pryv.js"></script> in your html file, before socket.io');
  }
  extendPryv(pryv);
})();
