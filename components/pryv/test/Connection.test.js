/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, beforeEach, afterEach, expect, JSDOM, pryv, Blob, FormData */

// URL and URLSearchParams are native in Node.js and browsers
const { createId: cuid } = require('@paralleldrive/cuid2');
const testData = require('../../../test/test-data');

let conn = null;

const isNode = (typeof window === 'undefined');

let readFileSync;
if (isNode) { // node
  readFileSync = require('fs').readFileSync;
}

describe('[CONX] Connection', () => {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    conn = new pryv.Connection(testData.apiEndpointWithToken);

    // create some events
    const toBeDeletedId = cuid();
    const toBeTrashed = cuid();
    await conn.api([
      {
        method: 'events.create',
        params: {
          streamIds: ['data'],
          type: 'note/txt',
          content: 'Hello test ' + new Date()
        }
      },
      {
        method: 'events.create',
        params: {
          streamIds: ['data'],
          type: 'note/txt',
          content: 'Hello test ' + new Date(),
          id: toBeTrashed
        }
      },
      {
        method: 'events.create',
        params: {
          id: toBeDeletedId,
          streamIds: ['data'],
          type: 'note/txt',
          content: 'To be Deleted ' + new Date()
        }
      },
      {
        method: 'events.delete',
        params: {
          id: toBeTrashed
        }
      },
      {
        method: 'events.delete',
        params: {
          id: toBeDeletedId
        }
      },
      {
        method: 'events.delete',
        params: {
          id: toBeDeletedId
        }
      }
    ]);
  });

  describe('[CSRV] .service', function () {
    it('[CSRA] return a pryv.Service object', async () => {
      const service = conn.service;
      expect(service instanceof pryv.Service).to.equal(true);
    });
  });

  describe('[CUSR] .username() ', function () {
    it('[CUSA] return the username of this connection', async () => {
      const username = await conn.username();
      expect(username).to.equal(testData.username);
    });
  });

  describe('[CAOX] .apiOne()', function () {
    this.timeout(15000);
    it('[CAOA] .apiOne("events.get")', async () => {
      const res = await conn.apiOne('events.get');
      expect(res.events).to.exist;
    });
    it('[CAOB] .apiOne("events.get") with path', async () => {
      const res = await conn.apiOne('events.get', {}, 'events');
      expect(Array.isArray(res)).to.equal(true);
    });
  });

  describe('[CAPX] .api()', function () {
    this.timeout(15000);
    it('[CAPA] .api() events.get', async () => {
      const res = await conn.api(
        [
          {
            method: 'events.get',
            params: {}
          }
        ]);
      expect(res.length).to.equal(1);
    });

    it('[CAPB] .api() events.get split in chunks', async () => {
      conn.options.chunkSize = 2;
      const res = await conn.api(
        [
          { method: 'events.get', params: {} },
          { method: 'events.get', params: {} },
          { method: 'events.get', params: {} }
        ]);
      expect(res.length).to.equal(3);
    });

    it('[CAPC] .api() events.get with handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsReceivedCount = 0;
      function oneMoreResult (res, apiCall) {
        expect(res.events).to.exist;
        expect(apiCall.method).to.equal('events.get');
        resultsReceivedCount++;
      }

      const res = await conn.api(
        [
          { method: 'events.get', params: {}, handleResult: oneMoreResult },
          { method: 'events.get', params: {}, handleResult: oneMoreResult },
          { method: 'events.get', params: {}, handleResult: oneMoreResult }
        ]);
      expect(res.length).to.equal(3);
      expect(res.length).to.equal(resultsReceivedCount);
    });

    it('[CAPD] .api() events.get with async handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsReceivedCount = 0;
      async function oneMoreResult (res) {
        expect(res.events).to.exist;

        const promise = new Promise((resolve, reject) => {
          setTimeout(() => resolve("Now it's done!"), 100);
        });
        // wait until the promise returns us a value
        await promise;
        resultsReceivedCount++;
      }

      const res = await conn.api(
        [
          { method: 'events.get', params: {}, handleResult: oneMoreResult },
          { method: 'events.get', params: {}, handleResult: oneMoreResult },
          { method: 'events.get', params: {}, handleResult: oneMoreResult }
        ]);
      expect(res.length).to.equal(3);
      expect(res.length).to.equal(resultsReceivedCount);
    });

    it('[CAPE] .api() events.get split in chunks and send percentages', async () => {
      conn.options.chunkSize = 2;
      const percentres = { 1: 67, 2: 100 };
      let count = 1;
      const res = await conn.api(
        [
          { method: 'events.get', params: {} },
          { method: 'events.get', params: {} },
          { method: 'events.get', params: {} }
        ], function (percent) {
          expect(percent).to.equal(percentres[count]);
          count++;
        });
      expect(res.length).to.equal(3);
    });

    it('[CAPF] .api() with callbacks', (done) => {
      conn.api(
        [
          { method: 'events.get', params: {} }
        ]).then((res) => {
        expect(res.length).to.equal(1);
        done();
      }, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('[CATX] Attachments', () => {
    it('[CATA] Node Only: Create event with attachment from file', async function () {
      if (!isNode) { this.skip(); }
      const res = await conn.createEventWithFile({
        type: 'picture/attached',
        streamIds: ['data']
      }, './test/Y.png');

      expect(res).to.exist;
      expect(res.event).to.exist;
      expect(res.event.attachments).to.exist;
      expect(res.event.attachments.length).to.equal(1);
      expect(res.event.attachments[0].size).to.equal(14798);
      expect(res.event.attachments[0].type).to.equal('image/png');
      expect(res.event.attachments[0].fileName).to.equal('Y.png');
    });

    it('[CATB] Node Only: Create event with attachment from Buffer', async function () {
      if (!isNode) { this.skip(); }

      const fileData = readFileSync('./test/Y.png');
      const res = await conn.createEventWithFileFromBuffer({
        type: 'picture/attached',
        streamIds: ['data']
      }, fileData, 'Y.png');

      expect(res).to.exist;
      expect(res.event).to.exist;
      expect(res.event.attachments).to.exist;
      expect(res.event.attachments.length).to.equal(1);
      expect(res.event.attachments[0].size).to.equal(14798);
      expect(res.event.attachments[0].type).to.equal('image/png');
      expect(res.event.attachments[0].fileName).to.equal('Y.png');
    });

    it('[CATC] Browser Only: Create event with attachment from Buffer', async function () {
      if (isNode) { this.skip(); }

      const blob = new Blob(['Hello'], { type: 'text/txt' });
      const res = await conn.createEventWithFileFromBuffer({
        type: 'picture/attached',
        streamIds: ['data']
      }, blob, 'Hello.txt');

      expect(res).to.exist;
      expect(res.event).to.exist;
      expect(res.event.attachments).to.exist;
      expect(res.event.attachments.length).to.equal(1);
      expect(res.event.attachments[0].size).to.equal(5);
      expect(res.event.attachments[0].type).to.equal('text/txt');
      expect(res.event.attachments[0].fileName).to.equal('Hello.txt');
    });

    it('[CATD] Browser Only: Create event with attachment formData', async function () {
      if (isNode) { this.skip(); }

      const formData = new FormData();
      const blob = new Blob(['Hello'], { type: 'text/txt' });
      formData.append('webmasterfile', blob);

      const res = await conn.createEventWithFormData({
        type: 'file/attached',
        streamIds: ['data']
      }, formData);

      expect(res).to.exist;
      expect(res.event).to.exist;
      expect(res.event.attachments).to.exist;
      expect(res.event.attachments.length).to.equal(1);
      expect(res.event.attachments[0].size).to.equal(5);
      expect(res.event.attachments[0].type).to.equal('text/txt');
      expect(res.event.attachments[0].fileName).to.equal('blob');
    });
  });

  describe('[CHFX] HF events', async function () {
    before(async function () {
      if (!await conn.service.supportsHF()) {
        this.skip();
      }
    });

    it('[CHFA] Add data points to HF event', async () => {
      const res = await conn.api([{
        method: 'events.create',
        params: {
          type: 'series:mass/kg',
          streamIds: ['data']
        }
      }]);
      expect(res).to.exist;
      expect(res[0]).to.exist;
      expect(res[0].event).to.exist;
      expect(res[0].event.id).to.exist;
      const event = res[0].event;

      const res2 = await conn.addPointsToHFEvent(
        event.id,
        ['deltaTime', 'value'],
        [[0, 1], [1, 1]]);

      expect(res2).to.exist;
      expect('ok').to.equal(res2.status);
    });
  });

  describe('[CGTX] .get()', () => {
    it('[CGTA] /events', async () => {
      const res = await conn.get('events', { limit: 1 });
      expect(res.events.length).to.equal(1);
    });

    it('[CGTB] /events with params', async () => {
      const res = await conn.get('events', { fromTime: 0, toTime: Date.now() / 1000, limit: 10000, types: ['note/txt'], streams: ['data', 'monitor-test'] });
      expect(res.events.length > 0).to.be.true;
      for (const event of res.events) {
        expect(event.type).to.equal('note/txt');
      }
    });
  });

  describe('[CTMX] time', () => {
    it('[CTMA] deltatime property', async () => {
      await conn.get('events', { limit: 1 });
      expect(conn.deltaTime).to.be.within(-2, 2);
    });
  });

  describe('[CEPX] API', () => {
    it('[CEPA] endpoint property', async () => {
      const [protocol, hostPath] = testData.serviceInfo.api.split('://');
      const challenge = protocol + '://' + conn.token + '@' + hostPath.replace('{username}', testData.username);
      const apiEndpoint = conn.apiEndpoint;
      expect(apiEndpoint).to.equal(challenge);
    });
  });

  describe('[CSTX] Streamed event get', function () {
    this.timeout(15000);
    const now = (new Date()).getTime() / 1000 + 1000;

    describe('[CSNX] Node & Browser', function () {
      it('[CSNA] streaming ', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
        let eventsCount = 0;
        function forEachEvent (event) { eventsCount++; }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(eventsCount).to.equal(res.eventsCount);
      });

      it('[CSNZ] streaming with query params', async () => {
        const queryParams = { fromTime: 0, toTime: Date.now() / 1000, limit: 10000, types: ['note/txt'], streams: ['data', 'monitor-test'] };
        let eventsCount = 0;
        function forEachEvent (event) {
          eventsCount++;
        }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(eventsCount).to.equal(res.eventsCount);
      });

      it('[CSNB] streaming includesDeletion', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000, includeDeletions: true, modifiedSince: 0, state: 'all' };
        let eventsCount = 0;
        let trashedCount = 0;
        let deletedCount = 0;
        function forEachEvent (event) {
          if (event.deleted) {
            deletedCount++;
          } else if (event.trashed) {
            trashedCount++;
          } else {
            eventsCount++;
          }
        }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(trashedCount + eventsCount).to.equal(res.eventsCount);
        expect(deletedCount).to.equal(res.eventDeletionsCount);
        expect(eventsCount).to.be.gt(0);
        expect(deletedCount).to.be.gt(0);
        expect(trashedCount).to.be.gt(0);
      });

      it('[CSNC] no-events ', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'] };
        function forEachEvent (event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
      });

      it('[CSND] no-events includeDeletions', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'], includeDeletions: true, modifiedSince: 0 };
        function forEachEvent (event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
        expect(res.eventDeletionsCount).to.be.gte(0);
      });
    });

    if (typeof window === 'undefined') {
      describe('[CSBX] Browser mock', function () {
        beforeEach(function () {
          const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost/' });
          global.document = dom.window.document;
          global.window = dom.window;
          global.location = dom.window.location;
        });

        afterEach(function () {
          delete global.document;
          delete global.window;
          delete global.location;
        });

        it('[CSBA] with fetch', async () => {
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent (event) { eventsCount++; }
          const res = await conn.getEventsStreamed(queryParams, forEachEvent);
          expect(eventsCount).to.equal(res.eventsCount);
        });
      });
    }
  });

  describe('[CAIX] Access Info', () => {
    let newUser;
    let accessInfoUser;
    before(async () => {
      newUser = (await conn.api([
        {
          method: 'accesses.create',
          params: {
            name: 'test' + Math.round(Math.random() * 10000),
            permissions: [
              {
                streamId: 'data',
                level: 'read'
              }
            ]
          }
        }
      ]))[0];
    });

    beforeEach(async () => {
      const regexAPIandToken = /(.+):\/\/(.+)/gm;
      const res = regexAPIandToken.exec(testData.apiEndpoint);
      const apiEndpointWithToken = res[1] + '://' + newUser.access.token + '@' + res[2];
      const newConn = new pryv.Connection(apiEndpointWithToken);
      accessInfoUser = await newConn.accessInfo();
    });

    after(async () => {
      await conn.api([
        {
          method: 'accesses.delete',
          params: {
            id: newUser.access.id
          }
        }
      ]);
    });

    it('[CAIA] has same username', () => {
      expect(accessInfoUser).to.exist;
      expect(accessInfoUser.name).to.exist;
      expect(newUser.access.name).to.equal(accessInfoUser.name);
    });

    it('[CAIB] has same token', () => {
      expect(accessInfoUser.token).to.exist;
      expect(newUser.access.token).to.equal(accessInfoUser.token);
    });
  });
});
