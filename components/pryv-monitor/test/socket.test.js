/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, conn, apiEndpoint, prepareAndCreateBaseStreams */

require('./load-helpers');
require('@pryv/socket.io')(pryv);

describe('Monitor + Socket.IO', function () {
  this.timeout(20000);

  before(async () => {
    await prepareAndCreateBaseStreams();
  });

  describe('socket updates', function () {
    this.timeout(25000);
    it('Detect new events added', async function () {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1 })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      await monitor.start();

      let count = 0;

      const eventData = {
        streamId: global.testStreamId,
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
  });

  describe('stop', () => {
    it('Monitor stops when requested', async function () {
      this.timeout(20000);
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1 })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      await monitor.start();
      let count = 0;
      await new Promise(resolve => setTimeout(resolve, 4000));
      monitor.stop();

      const eventData = {
        streamId: global.testStreamId,
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
