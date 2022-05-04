/* global chai, describe, it, before, Pryv */
/* eslint-disable no-unused-expressions */

const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const testData = require('./test-data.js');

describe('Service', function () {
  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('info()', async () => {
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);

    ['access', 'api', 'register'].forEach((key) => {
      should.exist(res[key]);
      // all API endpoints should end with a '/';
      res[key].slice(-1).should.equal('/');
    });
  });

  it('info() 2x ', async () => {
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);
    should.exist(res.access);
    const res2 = await pryvService.info();
    should.exist(res2);
    should.exist(res2.access);
  });

  it('login()', async function () {
    this.timeout(5000);
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const conn = await pryvService.login(testData.username, testData.password, 'jslib-test');
    should.exist(conn);
    should.exist(conn.token);
    should.exist(conn.endpoint);
  });

  it('assets()', async function () {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    should.exist(assets);

    // assets should be cached
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
      const serviceInfoCopy = Object.assign({}, testData.serviceInfo);
      delete serviceInfoCopy.assets;
      const pryvService = new Pryv.Service(null, serviceInfoCopy);
      const assets = await pryvService.assets();
      expect(assets).to.be.null;
    });

    it('login() failed', async function () {
      this.timeout(5000);
      const pryvService = new Pryv.Service(testData.serviceInfoUrl);
      await assert.isRejected(
        pryvService.login(testData.username, 'bobby', 'jslib-test'), 'The given username/password pair is invalid.');
    });
  });
});
