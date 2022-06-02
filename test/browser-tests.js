/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * Entry point for WebPack to build test series to be run in the browser
 */
/* global chai describe */

// load helpers

chai.use(require('chai-as-promised'));
global.expect = chai.expect;
global.testData = require('./test-data');

// the tests

describe('Pryv', function () {
  require('pryv/test/utils.test.js');
  require('pryv/test/Connection.test.js');
  require('pryv/test/Service.test.js');
  require('pryv/test/ServiceAssets.test.js');
  require('pryv/test/Browser.test.js');
  require('pryv/test/Browser.AuthController.test.js');
});

describe('Socket.io', function () {
  // require('pryv-socket.io/test/socket.io.test.js');
});
