/**
 * Load helpers for Node.js tests (loaded via .mocharc.js)
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));

global.expect = chai.expect;
global.Browser = require('zombie');
global.Pryv = require('pryv');
global.testData = require('./test-data');
