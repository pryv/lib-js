/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

describe('[CECX] Connection Edge Cases', function () {
  this.timeout(15000);

  let conn;

  before(async function () {
    await testData.prepare();
    conn = new pryv.Connection(testData.apiEndpointWithToken);
  });

  describe('[CERX] Error handling', function () {
    it('[CERA] api() throws on non-array input', async function () {
      let error = null;
      try {
        await conn.api({ method: 'events.get' });
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('array');
    });

    it('[CERB] apiOne() throws on error response', async function () {
      let error = null;
      try {
        await conn.apiOne('invalid.method', {});
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
    });

    it('[CERC] constructor throws on invalid service param', function () {
      let error = null;
      try {
        const _conn = new pryv.Connection(testData.apiEndpointWithToken, { notAService: true });
        expect(_conn).to.not.exist; // Should not reach here
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('Invalid service');
    });

    it('[CERD] _handleMeta throws on missing meta', async function () {
      let error = null;
      try {
        conn._handleMeta({}, Date.now() / 1000);
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('meta');
    });

    it('[CERE] _handleMeta throws on missing serverTime', async function () {
      let error = null;
      try {
        conn._handleMeta({ meta: {} }, Date.now() / 1000);
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('serverTime');
    });
  });

  describe('[CSCX] Service getter', function () {
    it('[CSCA] creates service when not provided', function () {
      const conn2 = new pryv.Connection(testData.apiEndpoint);
      const service = conn2.service;
      expect(service).to.exist;
      // Second access returns same instance
      expect(conn2.service).to.equal(service);
    });

    it('[CSCB] uses provided service', async function () {
      const service = new pryv.Service(testData.serviceInfoUrl);
      await service.info();
      const conn2 = new pryv.Connection(testData.apiEndpoint, service);
      expect(conn2.service).to.equal(service);
    });
  });

  describe('[CGEX] get() method', function () {
    it('[CGEA] get() without query params', async function () {
      const result = await conn.get('access-info');
      expect(result).to.exist;
    });

    it('[CGEB] get() with null query params', async function () {
      const result = await conn.get('access-info', null);
      expect(result).to.exist;
    });
  });
});
