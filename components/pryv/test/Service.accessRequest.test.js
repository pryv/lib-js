/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

describe('[ARQX] Service access-request init', function () {
  let service;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    service = new pryv.Service(testData.serviceInfoUrl);
  });

  describe('[ASTX] Service.startAccessRequest', function () {
    it('[ASTA] rejects when requestingAppId is missing', async function () {
      let caught;
      try { await service.startAccessRequest({}); } catch (e) { caught = e; }
      expect(caught).to.be.instanceOf(pryv.PryvError);
    });

    it('[ASTB] returns { key, authUrl, poll, pollRateMs }', async function () {
      this.timeout(15000);
      const env = await service.startAccessRequest({
        requestingAppId: 'jslib-test',
        requestedPermissions: [{
          streamId: 'data',
          level: 'read',
          defaultName: 'Test'
        }]
      });
      expect(env.key).to.be.a('string');
      expect(env.authUrl).to.be.a('string');
      expect(env.poll).to.be.a('string');
      expect(env.poll).to.match(/^https?:\/\//);
      expect(env.pollRateMs).to.be.a('number');
    });
  });

  describe('[APRX] Service.pollAccessRequest', function () {
    it('[APRA] rejects when key is missing', async function () {
      let caught;
      try { await service.pollAccessRequest(); } catch (e) { caught = e; }
      expect(caught).to.be.instanceOf(pryv.PryvError);
    });

    it('[APRB] polling a fresh request returns NEED_SIGNIN', async function () {
      this.timeout(15000);
      const env = await service.startAccessRequest({
        requestingAppId: 'jslib-test',
        requestedPermissions: [{
          streamId: 'data',
          level: 'read',
          defaultName: 'Test'
        }]
      });
      const state = await service.pollAccessRequest(env.poll);
      expect(state).to.exist;
      expect(state.status).to.equal('NEED_SIGNIN');
    });

    it('[APRC] accepts a bare key (no scheme) and builds the URL', async function () {
      this.timeout(15000);
      const env = await service.startAccessRequest({
        requestingAppId: 'jslib-test',
        requestedPermissions: [{
          streamId: 'data',
          level: 'read',
          defaultName: 'Test'
        }]
      });
      const state = await service.pollAccessRequest(env.key);
      expect(state).to.exist;
      expect(state.status).to.equal('NEED_SIGNIN');
    });
  });
});
