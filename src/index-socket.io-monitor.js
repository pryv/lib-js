const Pryv = require('./Pryv');
require('@pryv/socket.io')(Pryv);
//require('@pryv/monitor')(Pryv);
module.exports = Pryv;