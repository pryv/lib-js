/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

let conn = null;
const testStreamId = 'str-' + cuid().slice(0, 8);
const childStreamId = 'str-child-' + cuid().slice(0, 8);

describe('[STRX] Streams', () => {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    conn = new pryv.Connection(testData.apiEndpointWithToken);
  });

  describe('[SCRX] streams.create', function () {
    it('[SCRA] create a root stream', async () => {
      const res = await conn.api([{
        method: 'streams.create',
        params: { id: testStreamId, name: 'Test Stream' }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].stream).to.exist;
      expect(res[0].stream.id).to.equal(testStreamId);
      expect(res[0].stream.name).to.equal('Test Stream');
    });

    it('[SCRB] create a child stream', async () => {
      const res = await conn.api([{
        method: 'streams.create',
        params: { id: childStreamId, name: 'Child Stream', parentId: testStreamId }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].stream).to.exist;
      expect(res[0].stream.parentId).to.equal(testStreamId);
    });

    it('[SCRC] reject duplicate stream id', async () => {
      const res = await conn.api([{
        method: 'streams.create',
        params: { id: testStreamId, name: 'Duplicate' }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].error).to.exist;
      expect(res[0].error.id).to.equal('item-already-exists');
    });
  });

  describe('[SGTX] streams.get', function () {
    it('[SGTA] get all streams', async () => {
      const res = await conn.api([{
        method: 'streams.get',
        params: {}
      }]);
      expect(res[0]).to.exist;
      expect(res[0].streams).to.exist;
      expect(Array.isArray(res[0].streams)).to.equal(true);
      expect(res[0].streams.length).to.be.gt(0);
    });

    it('[SGTB] get stream tree includes parent and child', async () => {
      const res = await conn.api([{
        method: 'streams.get',
        params: {}
      }]);
      const streams = res[0].streams;
      const parent = findStream(streams, testStreamId);
      expect(parent).to.exist;
      expect(parent.children).to.exist;
      const child = parent.children.find(s => s.id === childStreamId);
      expect(child).to.exist;
    });
  });

  describe('[SUPX] streams.update', function () {
    it('[SUPA] rename a stream', async () => {
      const res = await conn.api([{
        method: 'streams.update',
        params: { id: childStreamId, update: { name: 'Renamed Child' } }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].stream).to.exist;
      expect(res[0].stream.name).to.equal('Renamed Child');
    });
  });

  describe('[SDLX] streams.delete', function () {
    it('[SDLA] trash a stream (first delete)', async () => {
      const res = await conn.api([{
        method: 'streams.delete',
        params: { id: childStreamId }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].stream).to.exist;
      expect(res[0].stream.trashed).to.equal(true);
    });

    it('[SDLB] delete a trashed stream (second delete)', async () => {
      const res = await conn.api([{
        method: 'streams.delete',
        params: { id: childStreamId }
      }]);
      expect(res[0]).to.exist;
      // After second delete, stream is gone
      expect(res[0].streamDeletion).to.exist;
    });
  });

  // Cleanup parent stream
  after(async () => {
    if (!conn) return;
    await conn.api([
      { method: 'streams.delete', params: { id: testStreamId } },
      { method: 'streams.delete', params: { id: testStreamId } }
    ]);
  });
});

function findStream (streams, id) {
  for (const s of streams) {
    if (s.id === id) return s;
    if (s.children) {
      const found = findStream(s.children, id);
      if (found) return found;
    }
  }
  return null;
}
