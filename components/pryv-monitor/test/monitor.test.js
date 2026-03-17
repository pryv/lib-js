/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, beforeEach, afterEach, expect, pryv, conn, apiEndpoint, prepareAndCreateBaseStreams */

require('./load-helpers');

describe('[MONX] Monitor', function () {
  this.timeout(20000);

  before(async function () {
    this.timeout(20000);
    await prepareAndCreateBaseStreams();
  });

  describe('[MINX] init', () => {
    it('[MINA] can be initialized with an apiEndpoint', async () => {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1 });
      await monitor.start();
    });

    it('[MINB] can be initialized with a connection', async () => {
      const monitor = new pryv.Monitor(conn, { limit: 1 });
      await monitor.start();
    });

    it('[MINC] throw Error on invalid apiEndpoint', async () => {
      let passed = true;
      try {
        pryv.Monitor('BlipBlop', { limit: 1 });
        passed = false;
      } catch (e) {

      }
      expect(passed).to.equal(true);
    });
  });

  describe('[MNTX] notifications', () => {
    let monitor = null;
    beforeEach(async () => {
      monitor = new pryv.Monitor(conn, { limit: 1, streams: [global.testStreamId] });
    });

    afterEach(async () => {
      monitor.stop();
    });

    it('[MNTA] Load events at start', async function () {
      // Create event before starting the monitor so it's picked up on initial load
      await conn.api([
        {
          method: 'events.create',
          params: {
            streamIds: [global.testStreamId],
            type: 'note/txt',
            content: 'hello monitor'
          }
        }
      ]);
      let count = 0;
      monitor.on('event', function (event) {
        count++;
      });
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(count).to.be.gt(0);
    });

    it('[MNTB] Detect new events added', async function () {
      let count = 0;
      await monitor.start();

      const eventData = {
        streamIds: [global.testStreamId],
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
      await new Promise(resolve => setTimeout(resolve, 8000));
      expect(count).to.be.gt(0);
    });
  });
});
