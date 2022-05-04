/**
 * Loaded by .mocharc.js for node tests
 */
/* global expect */
/* eslint-disable no-unused-expressions */
const chai = require('chai');
const Pryv = require('pryv');
require('../src')(Pryv); // Loading Monitor on Pryv
const testData = require('../node_modules/pryv/test/test-data.js');
global.chai = chai;
global.Pryv = Pryv;
global.testData = testData;
global.should = chai.should();
global.expect = chai.expect;
global.testStreamId = 'monitor-test';

global.prepareAndcreateBaseStreams = async () => {
  await testData.prepare();
  global.apiEndpoint = testData.apiEndpointWithToken;
  global.conn = new Pryv.Connection(global.apiEndpoint);
  const res = await global.conn.api([{
    method: 'streams.create',
    params: {
      id: global.testStreamId,
      name: global.testStreamId
    }
  }]);
  expect(res[0]).to.exist;
  if (res[0].stream) return;
  expect(res[0].error).to.exist;
  expect(res[0].error.id).to.equal('item-already-exists');
};
