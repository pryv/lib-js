
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
      .extractTokenAndApiEndpoint(testData.pryvApiEndPoints[0]);
    testData.defaults.token.should.equals(tokenAndAPI.token);
  
    (testData.pryvApiEndPoints[1]).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should work without token', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.pryvApiEndPoints[1]);
      
    should.not.exist(tokenAndAPI.token);

    (testData.pryvApiEndPoints[1]).should.equals(tokenAndAPI.endpoint);
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
        token: testData.defaults.token, 
        endpoint: testData.pryvApiEndPoints[1]});   
    apiEndPoint.should.equals(testData.pryvApiEndPoints[0]);
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndPoint = Pryv.utils
      .buildPryvApiEndPoint({
        token: null,
        endpoint: testData.pryvApiEndPoints[1]
      });
    apiEndPoint.should.equals(testData.pryvApiEndPoints[1]);
    done();
  });

  it('extractUsernameFromAPIAndEndpoint should retrieve username without token', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      testData.defaults.serviceInfoSettings.api,
      testData.pryvApiEndPoints[1]
    );
    expect(username).to.equals(testData.defaults.username);
  });

  it('extractUsernameFromAPIAndEndpoint should retrieve username with token', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      testData.defaults.serviceInfoSettings.api,
      testData.pryvApiEndPoints[0]
    );
    expect(username).to.equals(testData.defaults.username);
  });

  it('extractUsernameFromAPIAndEndpoint should work with DNSLess api schema', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      'https://test.pryv.me/{username}/',
      'https://' + testData.defaults.token + '@test.pryv.me/' + testData.defaults.username 
    );
    expect(username).to.equals(testData.defaults.username);
  });

  it('extractUsernameFromAPIAndEndpoint should fail with invalid api URL', async () => {
    let error = null;
    try { 
      const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
        'http://no-username.com/',
        testData.pryvApiEndPoints[0]
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
        testData.pryvApiEndPoints[0]
      );
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.equal('serviceInfoApi http://pryv.me/{username} schema does not match apiEndpoint: ' + testData.pryvApiEndPoints[0]);
  });

});


