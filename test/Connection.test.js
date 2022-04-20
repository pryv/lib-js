const should = chai.should();
const expect = chai.expect;
const testData = require('./test-data.js');
let conn = null;
const { URL, URLSearchParams } = require('universal-url');
const cuid = require('cuid');

const isNode = (typeof window === 'undefined');

let readFileSync;
if (isNode) { // node
  readFileSync = require('fs').readFileSync;
}

describe('Connection', () => {

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
    conn = new Pryv.Connection(testData.apiEndpointWithToken);

    // create some events
    const toBeDeletedId = cuid();
    const toBeTrashed = cuid();
    const resSetup = await conn.api([
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
          content: 'To be Deleted ' + new Date(),
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
    it('return a Pryv.Service object', async () => {
      const service = conn.service;
      expect(service instanceof Pryv.Service).to.equal(true);
    });

  });

  describe('.username() ', function () {
    it('return the username of this connection', async () => {
      const username = await conn.username();
      expect(username).to.equals(testData.username);
    });

  });


  describe('.api()', function () {
    this.timeout(5000);
    it('.api() events.get', async () => {
      const res = await conn.api(
        [
          {
            method: "events.get",
            params: {}
          }
        ]);
      res.length.should.equal(1);
    });

    it('.api() events.get split in chunks', async () => {
      conn.options.chunkSize = 2;
      const res = await conn.api(
        [
          { method: "events.get", params: {} },
          { method: "events.get", params: {} },
          { method: "events.get", params: {} }
        ]);
      res.length.should.equal(3);

    });


    it('.api() events.get with handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsRecievedCount = 0;
      function oneMoreResult(res) {
        should.exist(res.events);
        resultsRecievedCount++;
      }

      const res = await conn.api(
        [
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult }
        ]);
      res.length.should.equal(3);
      res.length.should.equal(resultsRecievedCount);
    });

    it('.api() events.get with async handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsRecievedCount = 0;
      async function oneMoreResult(res) {
        should.exist(res.events);

        let promise = new Promise((res, rej) => {
          setTimeout(() => res("Now it's done!"), 100)
        });
        // wait until the promise returns us a value
        await promise;
        resultsRecievedCount++;
      }

      const res = await conn.api(
        [
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult }
        ]);
      res.length.should.equal(3);
      res.length.should.equal(resultsRecievedCount);
    });

    it('.api() events.get split in chunks and send percentages', async () => {
      conn.options.chunkSize = 2;
      const percentres = { 1: 67, 2: 100 }
      let count = 1;
      const res = await conn.api(
        [
          { method: "events.get", params: {} },
          { method: "events.get", params: {} },
          { method: "events.get", params: {} }
        ], function (percent) {
          percent.should.equal(percentres[count]);
          count++;
        });
      res.length.should.equal(3);

    });

    it('.api() with callbacks', (done) => {
      conn.api(
        [
          { method: "events.get", params: {} }
        ]).then((res) => {
          res.length.should.equal(1);
          done();
        }, (err) => {
          should.not.exist(err);
          done();
        });

    });
  });

  describe('Attachements', () => {
    it('Node Only: Create event with attachment from file', async function () {
      if (!isNode) { this.skip(); }
      const res = await conn.createEventWithFile({
        type: 'picture/attached',
        streamIds: ['data']
      }, './test/Y.png');


      should.exist(res);
      should.exist(res.event);
      should.exist(res.event.attachments);
      res.event.attachments.length.should.equal(1);
      res.event.attachments[0].size.should.equal(14798);
      res.event.attachments[0].type.should.equal('image/png');
      res.event.attachments[0].fileName.should.equal('Y.png');
    });

    it('Node Only: Create event with attachment from Buffer', async function () {
      if (!isNode) { this.skip(); }

        const fileData = readFileSync('./test/Y.png');
        const res = await conn.createEventWithFileFromBuffer({
          type: 'picture/attached',
          streamIds: ['data']
        }, fileData, 'Y.png');

        should.exist(res);
        should.exist(res.event);
        should.exist(res.event.attachments);
        res.event.attachments.length.should.equal(1);
        res.event.attachments[0].size.should.equal(14798);
        res.event.attachments[0].type.should.equal('image/png');
        res.event.attachments[0].fileName.should.equal('Y.png');

    });

    it('Browser Only: Create event with attachment from Buffer', async function () {
      if (isNode) { this.skip(); }

        const blob = new Blob(['Hello'], { type: "text/txt" });
        const res = await conn.createEventWithFileFromBuffer({
          type: 'picture/attached',
          streamIds: ['data']
        }, blob, 'Hello.txt');

        should.exist(res);
        should.exist(res.event);
        console.log(res.event);
        should.exist(res.event.attachments);
        res.event.attachments.length.should.equal(1);
        res.event.attachments[0].size.should.equal(5);
        res.event.attachments[0].type.should.equal('text/txt');
        res.event.attachments[0].fileName.should.equal('Hello.txt');

    });

    it('Browser Only: Create event with attachment formData', async function () {
      if (isNode) { this.skip(); }

      const formData = new FormData();
      const blob = new Blob(['Hello'], { type: "text/txt" });
      formData.append("webmasterfile", blob);

      const res = await conn.createEventWithFormData({
        type: 'file/attached',
        streamIds: ['data']
      }, formData);


      should.exist(res);
      should.exist(res.event);
      should.exist(res.event.attachments);
      res.event.attachments.length.should.equal(1);
      res.event.attachments[0].size.should.equal(5);
      res.event.attachments[0].type.should.equal('text/txt');
      res.event.attachments[0].fileName.should.equal('blob');
    });


  });

  describe('HF events', () => {

    it('Add data points to HF event', async () => {

      const res = await conn.api([{
        method: 'events.create',
        params: {
          type: 'series:mass/kg',
          streamIds: ['data']
        }
      }]);
      should.exist(res);
      should.exist(res[0]);
      should.exist(res[0].event);
      should.exist(res[0].event.id);
      const event = res[0].event;

      const res2 = await conn.addPointsToHFEvent(
        event.id,
        ['deltaTime', 'value'],
        [[0, 1], [1, 1]]);

      should.exist(res2);
      'ok'.should.equal(res2.status);
    });

  });

  describe('.get()', () => {
    it('/events', async () => {
      const res = await conn.get('events', { limit: 1 });
      res.events.length.should.equal(1);
    });

  });

  describe('time', () => {
    it('deltatime property', async () => {
      await conn.get('events', { limit: 1 });
      const deltaTime = conn.deltaTime;
      expect(Math.abs(deltaTime) < 2).to.be.true;
    });
  });

  describe('API', () => {
    it('endpoint property', async () => {
      const apiEndpoint = conn.apiEndpoint;
      expect(apiEndpoint.startsWith('https://' + conn.token + '@')).to.be.true;
    });
  });

  describe('Streamed event get', function () {
    this.timeout(5000);
    const now = (new Date()).getTime() / 1000 + 1000;

    describe('Node & Browser', function () {
      it('streaming ', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
        let eventsCount = 0;
        function forEachEvent(event) { eventsCount++; }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(eventsCount).to.equal(res.eventsCount);
      });


      it('streaming includesDeletion', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000, includeDeletions: true, modifiedSince: 0, state: 'all' };
        let eventsCount = 0;
        let trashedCount = 0;
        let deletedCount = 0;
        function forEachEvent(event) {
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
        function forEachEvent(event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
      });

      it('no-events includeDeletions', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'], includeDeletions: true, modifiedSince: 0 };
        function forEachEvent(event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
        expect(res.eventDeletionsCount).to.be.gte(0);
      });
    });



    if (typeof window === 'undefined') {
      describe('Browser mock', function () {
        beforeEach(function () {
          const browser = new Browser();
          browser.visit('./');
          global.document = browser.document;
          global.window = browser.window;
          global.location = browser.location;
          function fetch(...args) {
            return browser.fetch(...args);
          }
          global.fetch = fetch;
          global.URL = URL;
          global.URLSearchParams = URLSearchParams;
        });

        afterEach(function () {
          delete global.document;
          delete global.window;
          delete global.location;
          delete global.fetch;
          delete global.URL;
          delete global.URLSearchParams;
        });

        it(' without fetch', async () => {
          delete global.fetch;
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent(event) { eventsCount++; }
          const res = await conn.getEventsStreamed(queryParams, forEachEvent);
          expect(eventsCount).to.equal(res.eventsCount);
        });

        xit(' with fetch', async () => {
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent(event) { eventsCount++; }
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
          method: "accesses.create", params: {
            "name": "test",
            "permissions": [
              {
                "streamId": "data",
                "level": "read"
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
      const newConn = new Pryv.Connection(apiEndpointWithToken);
      accessInfoUser = await newConn.accessInfo();
    });

    after(async () => {
      await conn.api([
        {
          method: "accesses.delete", params: {
            "id": newUser.access.id
          }
        }
      ]);
    });

    it('has same username', () => {
      should.exist(accessInfoUser);
      should.exist(accessInfoUser.name);
      should.equal(newUser.access.name, accessInfoUser.name);
    });

    it('has same token', () => {
      should.exist(accessInfoUser.token);
      should.equal(newUser.access.token, accessInfoUser.token);
    });

  });

});
