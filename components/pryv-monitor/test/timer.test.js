/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, conn, apiEndpoint, prepareAndCreateBaseStreams */

require('./load-helpers');

describe('Monitor + EventsTimer', function () {
  this.timeout(3000);

  before(async () => {
    await prepareAndCreateBaseStreams();
  });

  describe('init', () => {
    it('throw error if timer is not inistialized with correct time', async () => {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1 });
      try {
        /* eslint-disable-next-line no-new */
        new pryv.Monitor.UpdateMethod.EventsTimer(monitor, 'Rt');
      } catch (e) {
        return expect(e.message).to.equal('Monitor timer refresh rate is not valid. It should be a number > 1');
      }
      throw new Error('Should thow error');
    });
  });

  describe('timer updates', () => {
    it('Detect new events added', async function () {
      const monitor = new pryv.Monitor(apiEndpoint, { limit: 1 })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.EventsTimer(1));
      await monitor.start();
      let count = 0;

      // listener is added "after" so we don't get events loaded at start
      monitor.on('event', function (event) {
        expect(event.content).to.equal(eventData.content);
        count++;
      });

      const eventData = {
        streamId: global.testStreamId,
        type: 'note/txt',
        content: 'hello monitor ' + new Date()
      };

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
      const monitor = await new pryv.Monitor(apiEndpoint, { limit: 1 })
        .addUpdateMethod(new pryv.Monitor.UpdateMethod.EventsTimer(1));
      await monitor.start();

      let count = 0;
      await new Promise(resolve => setTimeout(resolve, 1000));
      monitor.stop();

      // listener is added "after" so we don't get events loaded at start
      monitor.on('event', function (event) {
        count++;
      });

      const eventData = {
        streamId: global.testStreamId,
        type: 'note/txt',
        content: 'hello monitor ' + new Date()
      };

      await conn.api([
        {
          method: 'events.create',
          params: eventData
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(count).to.equal(0);
    });
  });
});
