/**
 * Loaded by .mocharc.js for node tests
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);  
const Pryv = require('../src');
global.chai = chai;
global.Pryv = Pryv;