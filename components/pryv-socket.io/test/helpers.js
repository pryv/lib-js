/**
 * Loaded by .mocharc.js for node tests
 */
const chai = require('chai');
const Pryv = require('pryv');
require('../src')(Pryv); // Loading SocketIO on Pryv
const testData = require('pryv/test/test-data.js');
global.chai = chai;
global.Pryv = Pryv;
global.testData = testData;
global.should = chai.should();
global.expect = chai.expect;
