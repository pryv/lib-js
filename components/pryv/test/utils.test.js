/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

describe('[UTLX] utils', function () {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
  });

  it('[UTLA] extractTokenAndAPIEndpoint', function (done) {
    const tokenAndAPI = pryv.utils
      .extractTokenAndAPIEndpoint(testData.apiEndpointWithToken);
    expect(testData.token).to.equal(tokenAndAPI.token);

    expect(testData.apiEndpoint).to.equal(tokenAndAPI.endpoint);
    done();
  });

  it('[UTLB] extractTokenAndAPIEndpoint should work without token', function (done) {
    const tokenAndAPI = pryv.utils
      .extractTokenAndAPIEndpoint(testData.apiEndpoint);

    expect(tokenAndAPI.token).to.not.exist;

    expect(testData.apiEndpoint).to.equal(tokenAndAPI.endpoint);
    done();
  });

  it('[UTLC] extractTokenAndAPIEndpoint should fail on invalid url', function (done) {
    let error = null;
    try {
      pryv.utils.extractTokenAndAPIEndpoint('blip');
    } catch (e) {
      error = e;
      return done();
    }
    expect(error).to.exist;
  });

  it('[UTLD] buildAPIEndpoint with token', function (done) {
    const apiEndpoint = pryv.utils
      .buildAPIEndpoint({
        token: testData.token,
        endpoint: testData.apiEndpoint
      });
    expect(apiEndpoint).to.equal(testData.apiEndpointWithToken);
    done();
  });

  it('[UTLE] buildAPIEndpoint without token', function (done) {
    const apiEndpoint = pryv.utils
      .buildAPIEndpoint({
        token: null,
        endpoint: testData.apiEndpoint
      });
    expect(apiEndpoint).to.equal(testData.apiEndpoint);
    done();
  });
});
