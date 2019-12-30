
const should = chai.should();

const testData = require('./test-data.js');

describe('Service', function () {
  it('info()', async () => {
    const pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);
    should.exist(res.access);
  });
});


