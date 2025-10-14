/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, xit, before, after, beforeEach, afterEach, expect, Browser, pryv, Blob, FormData */
/* eslint-disable no-unused-expressions */

const { URL, URLSearchParams } = require('universal-url');
const cuid = require('cuid');
const testData = require('../../../test/test-data');

let conn = null;

const isNode = (typeof window === 'undefined');

let readFileSync;
if (isNode) { // node
  readFileSync = require('fs').readFileSync;
}

describe('Connection', () => {
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

  describe('.service', function () {
    it('return a pryv.Service object', async () => {
      const service = conn.service;
      expect(service instanceof pryv.Service).to.equal(true);
    });
  });

  describe('.username() ', function () {
    it('return the username of this connection', async () => {
      const username = await conn.username();
      expect(username).to.equal(testData.username);
    });
  });

  describe('.apiOne()', function () {
    this.timeout(15000);
    it('.apiOne("events.get")', async () => {
      const res = await conn.apiOne('events.get');
      expect(res.events).to.exist;
    });
    it('.apiOne("events.get")', async () => {
      const res = await conn.apiOne('events.get', {}, 'events');
      expect(Array.isArray(res)).to.equal(true);
    });
  });

  describe('.api()', function () {
    this.timeout(15000);
    it('.api() events.get', async () => {
      const res = await conn.api(
        [
          {
            method: 'events.get',
            params: {}
          }
        ]);
      expect(res.length).to.equal(1);
    });

    it('.api() events.get split in chunks', async () => {
      conn.options.chunkSize = 2;
      const res = await conn.api(
        [
          { method: 'events.get', params: {} },
          { method: 'events.get', params: {} },
          { method: 'events.get', params: {} }
        ]);
      expect(res.length).to.equal(3);
    });

    it('.api() events.get with handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsReceivedCount = 0;
      function oneMoreResult (res) {
        expect(res.events).to.exist;
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

    it('.api() events.get with async handleResult call', async () => {
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

    it('.api() events.get split in chunks and send percentages', async () => {
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

    it('.api() with callbacks', (done) => {
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

  describe('Attachments', () => {
    it('Node Only: Create event with attachment from file', async function () {
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

    it('Node Only: Create event with attachment from Buffer', async function () {
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

    it('Browser Only: Create event with attachment from Buffer', async function () {
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

    it('Browser Only: Create event with attachment formData', async function () {
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

  describe('HF events', async function () {
    before(async function () {
      if (!await conn.service.supportsHF()) {
        this.skip();
      }
    });

    it('Add data points to HF event', async () => {
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

  describe('.get()', () => {
    it('/events', async () => {
      const res = await conn.get('events', { limit: 1 });
      expect(res.events.length).to.equal(1);
    });
  });

  describe('time', () => {
    it('deltatime property', async () => {
      await conn.get('events', { limit: 1 });
      expect(conn.deltaTime).to.be.within(-2, 2);
    });
  });

  describe('API', () => {
    it('endpoint property', async () => {
      const [protocol, hostPath] = testData.serviceInfo.api.split('://');
      const challenge = protocol + '://' + conn.token + '@' + hostPath.replace('{username}', testData.username);
      const apiEndpoint = conn.apiEndpoint;
      expect(apiEndpoint).to.equal(challenge);
    });
  });

  describe('Streamed event get', function () {
    this.timeout(15000);
    const now = (new Date()).getTime() / 1000 + 1000;

    describe('Node & Browser', function () {
      it('streaming ', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
        let eventsCount = 0;
        function forEachEvent (event) { eventsCount++; }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(eventsCount).to.equal(res.eventsCount);
      });

      it('streaming includesDeletion', async () => {
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

      it('no-events ', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'] };
        function forEachEvent (event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
      });

      it('no-events includeDeletions', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'], includeDeletions: true, modifiedSince: 0 };
        function forEachEvent (event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
        expect(res.eventDeletionsCount).to.be.gte(0);
      });
    });

    if (typeof window === 'undefined') {
      describe('Browser mock', function () {
        const isNotAvailable = {
          URL: global.URL == null,
          URLSearchParams: global.URLSearchParams == null,
          fetch: global.fetch == null
        };
        beforeEach(function () {
          const browser = new Browser();
          browser.visit('./');
          global.document = browser.document;
          global.window = browser.window;
          global.location = browser.location;
          function fetch (...args) {
            return browser.fetch(...args);
          }
          if (isNotAvailable.fetch) global.fetch = fetch;
          if (isNotAvailable.URL) global.URL = URL;
          if (isNotAvailable.URLSearchParams) global.URLSearchParams = URLSearchParams;
        });

        afterEach(function () {
          delete global.document;
          delete global.window;
          delete global.location;
          if (isNotAvailable.fetch) delete global.fetch;
          if (isNotAvailable.URL) delete global.URL;
          if (isNotAvailable.URLSearchParams) delete global.URLSearchParams;
        });

        it(' without fetch', async () => {
          delete global.fetch;
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent (event) { eventsCount++; }
          const res = await conn.getEventsStreamed(queryParams, forEachEvent);
          expect(eventsCount).to.equal(res.eventsCount);
        });

        // HACK: skip until a solution is found to Zombie's `fetch()` not accepting URLs
        xit(' with fetch', async () => {
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent (event) { eventsCount++; }
          const res = await conn.getEventsStreamed(queryParams, forEachEvent);
          expect(eventsCount).to.equal(res.eventsCount);
        });
      });
    }
  });

  describe('Access Info', () => {
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

    it('has same username', () => {
      expect(accessInfoUser).to.exist;
      expect(accessInfoUser.name).to.exist;
      expect(newUser.access.name).to.equal(accessInfoUser.name);
    });

    it('has same token', () => {
      expect(accessInfoUser.token).to.exist;
      expect(newUser.access.token).to.equal(accessInfoUser.token);
    });
  });
});
