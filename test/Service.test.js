
const should = chai.should();
const expect = chai.expect;

const testData = require('./test-data.js');

describe('Service', function () {
  it('info()', async () => {
    const pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);
    should.exist(res.access);
  });

  it('info() 2x ', async () => {
    const pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);
    should.exist(res.access);
    const res2 = await pryvService.info();
    should.exist(res2);
    should.exist(res2.access);
  });

  it('login()', async function () {
    this.timeout(5000);
    const pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
    const conn = await pryvService.login(testData.defaults.user.split('.')[0], testData.defaults.password, 'jslib-test');
    should.exist(conn);
    should.exist(conn.token);
    should.exist(conn.endpoint);
    expect(conn.endpoint.includes(testData.defaults.user)).to.equal(true);
  });
});


