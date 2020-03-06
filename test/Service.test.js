
                   
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised); 

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


  

  it('assets()', async function() {
    const pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
    const assets = await pryvService.assets();
    should.exist(assets);

    //assets should be cached
    const assets2 = await pryvService.assets();
    expect(assets).to.equal(assets2);
  });

  describe('Errors', async function () {

    it('Throw error with invalid content', async () => {
      const service = new Pryv.Service(null, {});
      await assert.isRejected(service.info(), 
      'Invalid data from service/info');
    });

    it('Warn if no assets', async () => {
      let serviceInfoCopy = Object.assign({}, testData.defaults.serviceInfoSettings);
      delete serviceInfoCopy.assets;
      const pryvService = new Pryv.Service(null, serviceInfoCopy);
      const assets = await pryvService.assets();
      expect(assets).to.be.null;
    });

    it('login() failed', async function () {
      this.timeout(5000);
      const pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
      await assert.isRejected(
        pryvService.login(testData.defaults.user.split('.')[0], 'bobby', 'jslib-test'),'The given username/password pair is invalid.');
    });

  });
});


