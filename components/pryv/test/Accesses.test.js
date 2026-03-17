/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

let conn = null;
const testStreamId = 'acc-' + cuid().slice(0, 8);
let createdAccessId = null;
let createdAccessToken = null;

describe('[ACSX] Accesses', () => {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    conn = new pryv.Connection(testData.apiEndpointWithToken);

    // Create a test stream for permissions
    await conn.api([{
      method: 'streams.create',
      params: { id: testStreamId, name: 'Access Test Stream' }
    }]);
  });

  describe('[ACRX] accesses.create', function () {
    it('[ACRA] create a shared access', async () => {
      const res = await conn.api([{
        method: 'accesses.create',
        params: {
          name: 'test-shared-' + cuid().slice(0, 8),
          type: 'shared',
          permissions: [{ streamId: testStreamId, level: 'read' }]
        }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].access).to.exist;
      expect(res[0].access.token).to.exist;
      expect(res[0].access.type).to.equal('shared');
      createdAccessId = res[0].access.id;
      createdAccessToken = res[0].access.token;
    });

    it('[ACRB] create an app access', async () => {
      const res = await conn.api([{
        method: 'accesses.create',
        params: {
          name: 'test-app-' + cuid().slice(0, 8),
          type: 'app',
          permissions: [{ streamId: testStreamId, level: 'contribute' }]
        }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].access).to.exist;
      expect(res[0].access.type).to.equal('app');
    });

    it('[ACRC] reject access with invalid permission level', async () => {
      const res = await conn.api([{
        method: 'accesses.create',
        params: {
          name: 'bad-access',
          type: 'shared',
          permissions: [{ streamId: testStreamId, level: 'bogus' }]
        }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].error).to.exist;
    });
  });

  describe('[AGTX] accesses.get', function () {
    it('[AGTA] list accesses', async () => {
      const res = await conn.api([{
        method: 'accesses.get',
        params: {}
      }]);
      expect(res[0]).to.exist;
      expect(res[0].accesses).to.exist;
      expect(Array.isArray(res[0].accesses)).to.equal(true);
      expect(res[0].accesses.length).to.be.gt(0);
    });

    it('[AGTB] created access is in the list', async () => {
      const res = await conn.api([{
        method: 'accesses.get',
        params: {}
      }]);
      const found = res[0].accesses.find(a => a.id === createdAccessId);
      expect(found).to.exist;
      expect(found.token).to.equal(createdAccessToken);
    });
  });

  describe('[ADLX] accesses.delete', function () {
    it('[ADLA] delete (revoke) an access', async () => {
      expect(createdAccessId).to.exist;
      const res = await conn.api([{
        method: 'accesses.delete',
        params: { id: createdAccessId }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].accessDeletion).to.exist;
      expect(res[0].accessDeletion.id).to.equal(createdAccessId);
    });

    it('[ADLB] deleted access is no longer in the list', async () => {
      const res = await conn.api([{
        method: 'accesses.get',
        params: {}
      }]);
      const found = res[0].accesses.find(a => a.id === createdAccessId);
      expect(found).to.not.exist;
    });
  });

  // Cleanup
  after(async () => {
    if (!conn) return;
    await conn.api([
      { method: 'streams.delete', params: { id: testStreamId } },
      { method: 'streams.delete', params: { id: testStreamId } }
    ]);
  });
});
