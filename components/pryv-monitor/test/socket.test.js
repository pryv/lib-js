/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, conn, apiEndpoint, prepareAndCreateBaseStreams */

require('./load-helpers');
require('@pryv/socket.io')(pryv);

describe('[MSKX] Monitor + Socket.IO', function () {
  this.timeout(20000);

  before(async () => {
    await prepareAndCreateBaseStreams();
  });

  describe('[MSUX] socket updates', function () {
    this.timeout(25000);
    it('[MSUA] Detect new events added', async function () {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1, streams: [global.testStreamId] })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      await monitor.start();

      let count = 0;

      const eventData = {
        streamIds: [global.testStreamId],
        type: 'note/txt',
        content: 'hello monitor ' + new Date()
      };

      monitor.on('event', function (event) {
        expect(event.content).to.equal(eventData.content);
        count++;
      });
      await new Promise(resolve => setTimeout(resolve, 6000));
      await conn.api([
        {
          method: 'events.create',
          params: eventData
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 8000));
      monitor.stop();
      expect(count).to.be.gt(0);
    });

    /**
     * Resolves with the event `id` once `monitor` emits it, or with null
     * after `ms` milliseconds.
     */
    function emitted (monitor, id, ms) {
      return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(null), ms);
        monitor.on('event', (event) => {
          if (event.id !== id) return;
          clearTimeout(timer);
          resolve(event);
        });
      });
    }

    it('[MSUB] an event created right after `await start()` is notified', async function () {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1, streams: [global.testStreamId] })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      const seen = [];
      monitor.on('event', (event) => { seen.push(event.id); });
      try {
        await monitor.start();
        const res = await conn.api([{
          method: 'events.create',
          params: { streamIds: [global.testStreamId], type: 'note/txt', content: 'right after start ' + Date.now() }
        }]);
        const id = res[0].event.id;
        const event = await emitted(monitor, id, 10000);
        expect(event, 'event created right after start() not notified').to.exist;
        expect(seen.filter((s) => s === id).length).to.equal(1);
      } finally {
        monitor.stop();
      }
    });

    it('[MSUC] an event created between the initial fetch and the subscription is emitted before `start()` resolves', async function () {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1, streams: [global.testStreamId] })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      const seen = [];
      monitor.on('event', (event) => { seen.push(event.id); });
      // another writer creates an event once the initial fetch is done, just
      // before the update method opens its socket and subscribes
      let createdId = null;
      const socket = monitor.connection.socket;
      const open = socket.open.bind(socket);
      socket.open = async () => {
        const res = await conn.api([{
          method: 'events.create',
          params: { streamIds: [global.testStreamId], type: 'note/txt', content: 'before subscribe ' + Date.now() }
        }]);
        createdId = res[0].event.id;
        return await open();
      };
      try {
        await monitor.start();
        expect(createdId).to.exist;
        expect(seen).to.include(createdId);
      } finally {
        monitor.stop();
      }
    });
  });

  describe('[MSTX] stop', () => {
    it('[MSTA] Monitor stops when requested', async function () {
      this.timeout(20000);
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1, streams: [global.testStreamId] })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      await monitor.start();
      let count = 0;
      await new Promise(resolve => setTimeout(resolve, 4000));
      monitor.stop();

      const eventData = {
        streamIds: [global.testStreamId],
        type: 'note/txt',
        content: 'hello monitor ' + new Date()
      };

      monitor.on('event', function (event) {
        count++;
      });
      await conn.api([
        {
          method: 'events.create',
          params: eventData
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 6000));
      expect(count).to.equal(0);
    });
  });
});
