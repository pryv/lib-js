/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/* global Pryv */

/**
 * This entry point is for Browser only
 * It extends "Pryv" with Monitor capabilities
 */
const extendsPryv = require('./index.js');
(function () {
  if (Pryv == null) {
    throw new Error('"Pryv" is not accessible, add <script src="https://api.pryv.com/lib-js/pryv.js"></script> in your html file, before pryv-monitor.js');
  }
  extendsPryv(Pryv);
})();
