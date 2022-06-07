/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const pryv = require('./browser-index');
require('@pryv/socket.io')(pryv);
require('@pryv/monitor')(pryv);
module.exports = pryv;
