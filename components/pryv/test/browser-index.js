/**
 * Entry point for WebPack to build test series to be run in the browser
 */
/* global chai */

// load helpers

chai.use(require('chai-as-promised'));
global.expect = chai.expect;
global.testData = require('../../../test/test-data');

// the tests

require('./utils.test.js');
require('./Connection.test.js');
require('./Service.test.js');
require('./ServiceAssets.test.js');
require('./Browser.test.js');
require('./Browser.AuthController.test.js');
