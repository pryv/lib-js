/* global chai, describe, it, before, Pryv */

const should = chai.should();

const testData = require('./test-data.js');

describe('utils', function () {
  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('extractTokenAndApiEndpoint', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndpointWithToken);
    testData.token.should.equals(tokenAndAPI.token);

    (testData.apiEndpoint).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should work without token', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndpoint);

    should.not.exist(tokenAndAPI.token);

    (testData.apiEndpoint).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should fail on invalid url', function (done) {
    let error = null;
    try {
      Pryv.utils.extractTokenAndApiEndpoint('blip');
    } catch (e) {
      error = e;
      return done();
    }
    should.exist(error);
  });

  it('buildAPIEndpoint with token', function (done) {
    const apiEndpoint = Pryv.utils
      .buildPryvApiEndpoint({
        token: testData.token,
        endpoint: testData.apiEndpoint
      });
    apiEndpoint.should.equals(testData.apiEndpointWithToken);
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndpoint = Pryv.utils
      .buildPryvApiEndpoint({
        token: null,
        endpoint: testData.apiEndpoint
      });
    apiEndpoint.should.equals(testData.apiEndpoint);
    done();
  });
});
