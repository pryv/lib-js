/* global describe, it, before, beforeEach, afterEach, expect, conn, apiEndpoint, prepareAndcreateBaseStreams */

const Pryv = require('pryv');

describe('Monitor', function () {
  this.timeout(3000);

  before(async function () {
    this.timeout(5000);
    await prepareAndcreateBaseStreams();
  });

  describe('init', () => {
    it('can be initialized with an apiEndpoint', async () => {
      const monitor = new Pryv.Monitor(apiEndpoint, { limit: 1 });
      await monitor.start();
    });

    it('can be initialized with a connection', async () => {
      const monitor = new Pryv.Monitor(conn, { limit: 1 });
      await monitor.start();
    });

    it('throw Error on invalid apiEndpoint', async () => {
      let passed = true;
      try {
        /* eslint-disable-next-line no-unused-vars */
        const monitor = new Pryv.Monitor('BlipBlop', { limit: 1 });
        passed = false;
      } catch (e) {

      }
      expect(passed).to.equal(true);
    });
  });

  describe('notifications', () => {
    let monitor = null;
    beforeEach(async () => {
      monitor = new Pryv.Monitor(conn, { limit: 1 });
    });

    afterEach(async () => {
      monitor.stop();
    });

    it('Load events at start', async function () {
      let count = 0;
      monitor.on('event', function (event) {
        count++;
      });
      await monitor.start();
      await conn.api([
        {
          method: 'events.create',
          params: {
            streamId: global.testStreamId,
            type: 'note/txt',
            content: 'hello monitor'
          }
        }
      ]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(count).to.be.gt(0);
    });

    it('Detect new events added', async function () {
      let count = 0;
      await monitor.start();

      const eventData = {
        streamId: global.testStreamId,
        type: 'note/txt',
        content: 'hello monitor ' + new Date()
      };

      monitor.on('event', function (event) {
        expect(event.content).to.equal(eventData.content);
        count++;
      });
      await conn.api([
        {
          method: 'events.create',
          params: eventData
        }
      ]);
      await monitor.updateEvents(); // trigger refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(count).to.be.gt(0);
    });
  });
});
