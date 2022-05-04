/* global describe, it, before, expect, Pryv, conn, apiEndpoint, prepareAndcreateBaseStreams */

require('@pryv/socket.io')(Pryv);

describe('Monitor + Socket.io', function () {
  this.timeout(3000);

  before(async () => {
    await prepareAndcreateBaseStreams();
  });

  describe('socket updates', function () {
    this.timeout(5000);
    it('Detect new events added', async function () {
      const monitor = new Pryv.Monitor(apiEndpoint, { limit: 1 })
        .addUpdateMethod(new Pryv.Monitor.UpdateMethod.Socket());
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      await conn.api([
        {
          method: 'events.create',
          params: eventData
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));
      monitor.stop();
      expect(count).to.be.gt(0);
    });
  });

  describe('stop', () => {
    it('Monitor stops when requested', async function () {
      this.timeout(4000);
      const monitor = new Pryv.Monitor(apiEndpoint, { limit: 1 })
        .addUpdateMethod(new Pryv.Monitor.UpdateMethod.Socket());
      await monitor.start();
      let count = 0;
      await new Promise(resolve => setTimeout(resolve, 1000));
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

      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(count).to.equals(0);
    });
  });
});
