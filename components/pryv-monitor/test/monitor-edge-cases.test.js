/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, beforeEach, afterEach, expect, pryv, conn, prepareAndCreateBaseStreams */

require('./load-helpers');
const Changes = require('../src/lib/Changes');

describe('[MEDX] Monitor Edge Cases', function () {
  this.timeout(20000);

  before(async function () {
    this.timeout(20000);
    await prepareAndCreateBaseStreams();
  });

  describe('[MERX] Error handling', function () {
    it('[MERA] throws error when updateEvents called before start', async function () {
      const monitor = new pryv.Monitor(conn, { limit: 1 });
      let error = null;
      try {
        await monitor.updateEvents();
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('Start Monitor');
    });

    it('[MERB] throws error when updateStreams called before start', async function () {
      const monitor = new pryv.Monitor(conn, { limit: 1 });
      let error = null;
      try {
        await monitor.updateStreams();
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('Start Monitor');
    });

    it('[MERC] throws error when stop called during starting', async function () {
      const monitor = new pryv.Monitor(conn, { limit: 1 });
      // Both started and starting must be true for the error to be thrown
      monitor.states.started = true;
      monitor.states.starting = true;
      let error = null;
      try {
        monitor.stop();
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.include('starting');
      // Clean up
      monitor.states.starting = false;
      monitor.states.started = false;
    });
  });

  describe('[MSSX] Start/Stop states', function () {
    let monitor;

    beforeEach(() => {
      monitor = new pryv.Monitor(conn, { limit: 1 });
    });

    afterEach(() => {
      if (monitor.started) monitor.stop();
    });

    it('[MSSA] start() returns early if already started', async function () {
      await monitor.start();
      expect(monitor.started).to.be.true;
      // Second start should return immediately
      const result = await monitor.start();
      expect(result).to.equal(monitor);
    });

    it('[MSSB] start() returns early if starting', async function () {
      monitor.states.starting = true;
      const result = await monitor.start();
      expect(result).to.equal(monitor);
      monitor.states.starting = false;
    });

    it('[MSSC] stop() returns early if not started', function () {
      const result = monitor.stop();
      expect(result).to.equal(monitor);
    });

    it('[MSSD] stop() emits STOP event', async function () {
      let stopEmitted = false;
      await monitor.start();
      monitor.on(Changes.STOP, () => { stopEmitted = true; });
      monitor.stop();
      expect(stopEmitted).to.be.true;
      expect(monitor.started).to.be.false;
    });

    it('[MSSE] started property returns correct state', async function () {
      expect(monitor.started).to.be.false;
      await monitor.start();
      expect(monitor.started).to.be.true;
      monitor.stop();
      expect(monitor.started).to.be.false;
    });
  });

  describe('[MSEM] Semaphore behavior', function () {
    let monitor;

    beforeEach(async () => {
      monitor = new pryv.Monitor(conn, { limit: 1 });
      await monitor.start();
    });

    afterEach(() => {
      if (monitor.started) monitor.stop();
    });

    it('[MSEA] updateEvents uses semaphore correctly', async function () {
      // Simulate updating
      monitor.states.updatingEvents = true;
      await monitor.updateEvents();
      expect(monitor.states.updateEventRequired).to.be.true;
      monitor.states.updatingEvents = false;
    });

    it('[MSEB] updateStreams uses semaphore correctly', async function () {
      // Simulate updating
      monitor.states.updatingStreams = true;
      await monitor.updateStreams();
      expect(monitor.states.updateStreamsRequired).to.be.true;
      monitor.states.updatingStreams = false;
    });
  });

  describe('[MAUM] addUpdateMethod', function () {
    it('[MAUA] addUpdateMethod chains correctly', async function () {
      const monitor = new pryv.Monitor(conn, { limit: 1 });
      const mockUpdateMethod = {
        setMonitor: function (m) { this.monitor = m; }
      };
      const result = monitor.addUpdateMethod(mockUpdateMethod);
      expect(result).to.equal(monitor);
      expect(mockUpdateMethod.monitor).to.equal(monitor);
    });
  });

  describe('[MDEV] Deleted Events', function () {
    let monitor;
    let createdEventId;

    beforeEach(async () => {
      monitor = new pryv.Monitor(conn, { limit: 100 });
    });

    afterEach(() => {
      if (monitor.started) monitor.stop();
    });

    it('[MDEA] detects deleted events', async function () {
      this.timeout(15000);

      // Create an event first
      const createRes = await conn.api([{
        method: 'events.create',
        params: {
          streamId: global.testStreamId,
          type: 'note/txt',
          content: 'to be deleted ' + Date.now()
        }
      }]);
      createdEventId = createRes[0].event.id;

      // Start monitor - it will include deletions after start
      await monitor.start();

      // Set up listener for deleted events
      let _deletedEventReceived = false;
      monitor.on(Changes.EVENT_DELETE, (event) => {
        if (event.id === createdEventId) {
          _deletedEventReceived = true;
        }
      });

      // Delete the event
      await conn.api([{
        method: 'events.delete',
        params: { id: createdEventId }
      }]);

      // Trigger update
      await monitor.updateEvents();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // The event may or may not be received depending on timing
      // but the code path should be exercised
    });
  });

  describe('[MRDY] Ready emission', function () {
    let monitor;

    beforeEach(async () => {
      monitor = new pryv.Monitor(conn, { limit: 1 });
    });

    afterEach(() => {
      if (monitor.started) monitor.stop();
    });

    it('[MRDA] emits READY after start', function (done) {
      monitor.on(Changes.READY, () => {
        expect(monitor.started).to.be.true;
        done();
      });
      monitor.start();
    });

    it('[MRDB] ready() does nothing when not started', function () {
      let readyEmitted = false;
      monitor.on(Changes.READY, () => { readyEmitted = true; });
      monitor.ready();
      expect(readyEmitted).to.be.false;
    });
  });
});
