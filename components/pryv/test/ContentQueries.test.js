/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv */

const { createId: cuid } = require('@paralleldrive/cuid2');
const testData = require('../../../test/test-data');

const buildSearchParams = require('../src/lib/buildSearchParams');
const resolveDotPath = require('../src/lib/resolveDotPath');

describe('[CQLJ] Content queries', () => {
  describe('[CQLU] buildSearchParams structured values', () => {
    it('[LU01] keeps scalar arrays as repeated keys', () => {
      expect(buildSearchParams({ a: ['x', 'y'], b: 1 })).to.equal('a=x&a=y&b=1');
    });

    it('[LU02] JSON-encodes arrays of objects (conditions) as one parameter', () => {
      const conditions = [{ path: 'drug.codes.atc', eq: 'G03DA04' }];
      const out = buildSearchParams({ content: conditions });
      expect(decodeURIComponent(out)).to.equal('content=' + JSON.stringify(conditions));
    });

    it('[LU03] JSON-encodes plain object values', () => {
      const out = buildSearchParams({ streams: { any: ['a'] } });
      expect(decodeURIComponent(out.replace(/\+/g, ' '))).to.equal('streams=' + JSON.stringify({ any: ['a'] }));
    });
  });

  describe('[CQLR] resolveDotPath', () => {
    it('[LR01] resolves nested paths, root $ and misses', () => {
      const content = { drug: { codes: { atc: 'G03DA04' } }, taken: true };
      expect(resolveDotPath(content, 'drug.codes.atc')).to.equal('G03DA04');
      expect(resolveDotPath(content, 'taken')).to.equal(true);
      expect(resolveDotPath(content, 'drug.codes.snomed')).to.equal(undefined);
      expect(resolveDotPath(14.2, '$')).to.equal(14.2);
      expect(resolveDotPath(undefined, 'a.b')).to.equal(undefined);
      expect(resolveDotPath({ a: [1] }, 'a.0')).to.equal(undefined); // no array indices
    });
  });

  describe('[CQLI] against a live platform (skipped when unsupported)', () => {
    let conn, supported, streamId;
    const codes = { progesterone: 'G03DA04', aspirin: 'B01AC06', missing: 'N02BE01' };

    before(async function () {
      this.timeout(15000);
      await testData.prepare();
      conn = new pryv.Connection(testData.apiEndpointWithToken);
      supported = await conn.service.supportsContentQueries();
      if (!supported) return;

      streamId = 'cq-' + cuid().substring(0, 8);
      const calls = [{ method: 'streams.create', params: { id: streamId, name: 'CQ ' + streamId, parentId: 'data' } }];
      // two assertions per drug — older taken:false, newer taken:true — to verify "latest"
      let time = 1700000000;
      for (const code of [codes.progesterone, codes.aspirin]) {
        calls.push({ method: 'events.create', params: { streamIds: [streamId], type: 'medication/exposure-assertion-v1', time: time++, content: { drug: { codes: { atc: code } }, taken: false } } });
        calls.push({ method: 'events.create', params: { streamIds: [streamId], type: 'medication/exposure-assertion-v1', time: time++, content: { drug: { codes: { atc: code } }, taken: true } } });
      }
      const res = await conn.api(calls);
      for (const r of res) expect(r.error).to.be.undefined;
    });

    it('[LI01] supportsContentQueries returns a boolean', async () => {
      expect(typeof supported).to.equal('boolean');
    });

    it('[LI02] events.get accepts content conditions via GET (streamed)', async function () {
      if (!supported) this.skip();
      const collected = [];
      await conn.getEventsStreamed(
        { streams: [streamId], content: [{ path: 'drug.codes.atc', eq: codes.progesterone }, { path: 'taken', eq: true }] },
        (event) => collected.push(event)
      );
      expect(collected.length).to.equal(1);
      expect(collected[0].content.taken).to.equal(true);
    });

    it('[LI03] getLatestByContent returns the latest event per value', async function () {
      if (!supported) this.skip();
      const byCode = await conn.getLatestByContent(
        'drug.codes.atc',
        [codes.progesterone, codes.aspirin, codes.missing],
        { streams: [streamId] }
      );
      expect(byCode.size).to.equal(2);
      expect(byCode.get(codes.missing)).to.be.undefined;
      // latest per code is the taken:true one (created later)
      expect(byCode.get(codes.progesterone).content.taken).to.equal(true);
      expect(byCode.get(codes.aspirin).content.taken).to.equal(true);
    });
  });
});
