
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

  it('buildAPIEndpoint', function (done) {
    const apiEndPoint = Pryv.utils
      .buildPryvApiEndPoint({ 
        token: testData.defaults.token, 
        endpoint: 'https://' + testData.defaults.user + '/'});
    
    apiEndPoint.should.equals(testData.pryvApiEndPoints[0] + '/');

    done();
  });

});


