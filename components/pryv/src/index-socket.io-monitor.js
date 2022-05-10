/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const Pryv = require('./Pryv');
require('@pryv/socket.io')(Pryv);
require('@pryv/monitor')(Pryv);
module.exports = Pryv;
