/* global describe, it, before, expect, Pryv, testData */
/* eslint-disable no-unused-expressions */

describe('Service', function () {
  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('info()', async () => {
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const res = await pryvService.info();
    expect(res).to.exist;

    ['access', 'api', 'register'].forEach((key) => {
      expect(res[key]).to.exist;
      // all API endpoints should end with a '/';
      expect(res[key].slice(-1)).to.equal('/');
    });
  });

  it('info() 2x ', async () => {
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const res = await pryvService.info();
    expect(res).to.exist;
    expect(res.access).to.exist;
    const res2 = await pryvService.info();
    expect(res2).to.exist;
    expect(res2.access).to.exist;
  });

  it('login()', async function () {
    this.timeout(5000);
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const conn = await pryvService.login(testData.username, testData.password, 'jslib-test');
    expect(conn).to.exist;
    expect(conn.token).to.exist;
    expect(conn.endpoint).to.exist;
  });

  it('assets()', async function () {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    expect(assets).to.exist;

    // assets should be cached
    const assets2 = await pryvService.assets();
    expect(assets).to.equal(assets2);
  });

  describe('Errors', async function () {
    it('Throw error with invalid content', async () => {
      const service = new Pryv.Service(null, {});
      await expect(service.info()).to.be.rejectedWith('Invalid data from service/info');
    });

    it('Warn if no assets', async () => {
      const serviceInfoCopy = Object.assign({}, testData.serviceInfo);
      delete serviceInfoCopy.assets;
      const pryvService = new Pryv.Service(null, serviceInfoCopy);
      const assets = await pryvService.assets();
      expect(assets).to.be.null;
    });

    it('login() failed', async function () {
      this.timeout(5000);
      const pryvService = new Pryv.Service(testData.serviceInfoUrl);
      await expect(pryvService.login(testData.username, 'bobby', 'jslib-test')).to.be.rejectedWith('The given username/password pair is invalid.');
    });
  });
});
