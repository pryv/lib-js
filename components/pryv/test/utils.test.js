/* global describe, it, before, expect, Pryv, testData */
/* eslint-disable no-unused-expressions */

describe('utils', function () {
  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('extractTokenAndApiEndpoint', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndpointWithToken);
    expect(testData.token).to.equal(tokenAndAPI.token);

    expect(testData.apiEndpoint).to.equal(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should work without token', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndpoint);

    expect(tokenAndAPI.token).to.not.exist;

    expect(testData.apiEndpoint).to.equal(tokenAndAPI.endpoint);
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
    expect(error).to.exist;
  });

  it('buildAPIEndpoint with token', function (done) {
    const apiEndpoint = Pryv.utils
      .buildPryvApiEndpoint({
        token: testData.token,
        endpoint: testData.apiEndpoint
      });
    expect(apiEndpoint).to.equal(testData.apiEndpointWithToken);
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndpoint = Pryv.utils
      .buildPryvApiEndpoint({
        token: null,
        endpoint: testData.apiEndpoint
      });
    expect(apiEndpoint).to.equal(testData.apiEndpoint);
    done();
  });
});
