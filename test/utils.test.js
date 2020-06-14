
const should = chai.should();
const expect = chai.expect;

const testData = require('./test-data.js');

describe('utils', function () {
  it('extractTokenAndApiEndpoint', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.pryvApiEndPoints[0]);
    testData.defaults.token.should.equals(tokenAndAPI.token);

    ('https://' + testData.defaults.user + '/').should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should work without token', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.pryvApiEndPoints[1]);
      
    should.not.exist(tokenAndAPI.token);

    ('https://' + testData.defaults.user + '/').should.equals(tokenAndAPI.endpoint);
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
        endpoint: 'https://' + testData.defaults.user});   
    apiEndPoint.should.equals(testData.pryvApiEndPoints[0] + '/');
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndPoint = Pryv.utils
      .buildPryvApiEndPoint({
        token: null,
        endpoint: 'https://' + testData.defaults.user
      });
    apiEndPoint.should.equals('https://' + testData.defaults.user + '/');
    done();
  });

  it('extractUsernameFromAPIAndEndpoint should retrieve username without token', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      testData.defaults.serviceInfoSettings.api,
      'https://' + testData.defaults.user
    );
    expect(username).to.equals(testData.defaults.username);
  });

  it('extractUsernameFromAPIAndEndpoint should retrieve username with token', async () => {
    const username = Pryv.utils.extractUsernameFromAPIAndEndpoint(
      testData.defaults.serviceInfoSettings.api,
      'https://' + testData.defaults.token + '@' + testData.defaults.user
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
        'https://' + testData.defaults.token + '@' + testData.defaults.user
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
        'https://' + testData.defaults.token + '@' + testData.defaults.user
      );
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.equal('serviceInfoApi http://pryv.me/{username} schema does not match apiEndpoint: https://ck60yn9yv00011hd3vu1ocpi7@jslibtest.pryv.me');
  });

});


