/**
 * Loaded by .mocharc.js for node tests
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));

global.expect = chai.expect;
global.Pryv = require('pryv');
global.testData = require('./test-data');
