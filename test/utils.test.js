
const should = chai.should();
const expect = chai.expect;

const testData = require('./test-data.js');

describe('utils', function () {

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('extractTokenAndApiEndpoint', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndPointWithToken);
    testData.token.should.equals(tokenAndAPI.token);
  
    (testData.apiEndPoint).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should work without token', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndPoint);
      
    should.not.exist(tokenAndAPI.token);

    (testData.apiEndPoint).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should fail on invalid url', function (done) {
    let error = null;
    try {
      const tokenAndAPI = Pryv.utils
        .extractTokenAndApiEndpoint('blip');
    } catch (e) {
      error = e;
      
      return done();
    }
    should.exist(error);
    
  });

  it('buildAPIEndpoint with token', function (done) {
    const apiEndPoint = Pryv.utils
      .buildPryvApiEndPoint({ 
        token: testData.token, 
        endpoint: testData.apiEndPoint});   
    apiEndPoint.should.equals(testData.apiEndPointWithToken);
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndPoint = Pryv.utils
      .buildPryvApiEndPoint({
        token: null,
        endpoint: testData.apiEndPoint
      });
    apiEndPoint.should.equals(testData.apiEndPoint);
    done();
  });

  it('extractUsernameFromAPIAndEndpoint should retrieve username without token', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      testData.serviceInfo.api,
      testData.apiEndPoint
    );
    expect(username).to.equals(testData.username);
  });

  it('extractUsernameFromAPIAndEndpoint should retrieve username with token', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      testData.serviceInfo.api,
      testData.apiEndPointWithToken
    );
    expect(username).to.equals(testData.username);
  });

  it('extractUsernameFromAPIAndEndpoint should work with DNSLess api schema', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      'https://test.pryv.me/{username}/',
      'https://' + testData.token + '@test.pryv.me/' + testData.username 
    );
    expect(username).to.equals(testData.username);
  });

  it('extractUsernameFromAPIAndEndpoint should fail with invalid api URL', async () => {
    let error = null;
    try { 
      const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
        'http://no-username.com/',
        testData.apiEndPointWithToken
      );
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.equal('Invalid API schema with no {username} placeholder');
  });

  it('extractUsernameFromAPIAndEndpoint should fail with not matching endpoints', async () => {
    let error = null;
    try {
      const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
        'http://pryv.me/{username}',
        testData.apiEndPointWithToken
      );
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.equal('serviceInfoApi http://pryv.me/{username} schema does not match apiEndpoint: ' + testData.apiEndPointWithToken);
  });

});


