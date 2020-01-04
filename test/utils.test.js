
const should = chai.should();

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
        endpoint: 'https://' + testData.defaults.user + '/'});   
    apiEndPoint.should.equals(testData.pryvApiEndPoints[0] + '/');
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndPoint = Pryv.utils
      .buildPryvApiEndPoint({
        token: null,
        endpoint: 'https://' + testData.defaults.user + '/'
      });
    apiEndPoint.should.equals('https://' + testData.defaults.user + '/');
    done();
  });

});


