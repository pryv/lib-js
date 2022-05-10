/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global expect, Pryv, testData */
/* eslint-disable no-unused-expressions */

require('../src')(Pryv);
const testStreamId = global.testStreamId = 'monitor-test';

global.prepareAndCreateBaseStreams = async () => {
  await testData.prepare();
  global.apiEndpoint = testData.apiEndpointWithToken;
  global.conn = new Pryv.Connection(global.apiEndpoint);
  const res = await global.conn.api([{
    method: 'streams.create',
    params: {
      id: testStreamId,
      name: testStreamId
    }
  }]);
  expect(res[0]).to.exist;
  if (res[0].stream) return;
  expect(res[0].error).to.exist;
  expect(res[0].error.id).to.equal('item-already-exists');
};
