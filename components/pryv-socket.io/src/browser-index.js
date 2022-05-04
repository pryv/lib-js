
/* global Pryv */

/**
 * This entry point is for Browser only
 * It extends "Pryv" with Socket.io capabilities
 */
const extendsPryv = require('./index.js');
(function () {
  if (Pryv == null) {
    throw new Error('"Pryv" is not accessible, add <script src="https://api.pryv.com/lib-js/pryv.js"></script> in your html file, before socket.io');
  }
  extendsPryv(Pryv);
})();
