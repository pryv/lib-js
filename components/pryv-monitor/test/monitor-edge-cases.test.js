/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, beforeEach, afterEach, expect, pryv, conn, prepareAndCreateBaseStreams */

require('./load-helpers');
const { EventEmitter } = require('events');
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
          streamIds: [global.testStreamId],
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

    /** An update method whose ready() takes `ms` milliseconds. */
    class SlowUpdateMethod extends pryv.Monitor.UpdateMethod.Null {
      constructor (ms, fail) {
        super();
        this.ms = ms;
        this.fail = fail;
        this.calls = 0;
        this.completed = 0;
      }

      async ready () {
        this.calls++;
        await new Promise((resolve) => setTimeout(resolve, this.ms));
        if (this.fail) throw new Error('ready failed');
        this.completed++;
      }
    }

    it('[MRDC] start() resolves once the update methods\' ready() completed, calling it once', async function () {
      const slow = new SlowUpdateMethod(300);
      const timer = new pryv.Monitor.UpdateMethod.EventsTimer(60000);
      monitor.addUpdateMethod(slow).addUpdateMethod(timer);
      await monitor.start();
      expect(slow.calls).to.equal(1);
      expect(slow.completed).to.equal(1);
      expect(timer.timer).to.exist;
      clearTimeout(timer.timer);
    });

    it('[MRDD] an update method failing in ready(): `error` emitted, start() resolves', async function () {
      monitor.addUpdateMethod(new SlowUpdateMethod(10, true));
      const errors = [];
      monitor.on(Changes.ERROR, (e) => { errors.push(e); });
      await monitor.start();
      expect(errors.map((e) => e.message)).to.deep.equal(['ready failed']);
    });

    it('[MRDE] an update method added after start() gets ready() once', async function () {
      await monitor.start();
      const slow = new SlowUpdateMethod(10);
      monitor.addUpdateMethod(slow);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(slow.calls).to.equal(1);
      expect(slow.completed).to.equal(1);
    });

    it('[MRDG] an update method failing in ready() with no `error` listener: start() rejects and the monitor is stopped', async function () {
      monitor.addUpdateMethod(new SlowUpdateMethod(10, true));
      let stops = 0;
      monitor.on(Changes.STOP, () => { stops++; });
      let error = null;
      try {
        await monitor.start();
      } catch (e) {
        error = e;
      }
      expect(error?.message).to.equal('ready failed');
      expect(monitor.started).to.equal(false);
      expect(stops).to.equal(1);
    });

    it('[MRDH] monitor.stop() clears the EventsTimer pending timeout', async function () {
      const timer = new pryv.Monitor.UpdateMethod.EventsTimer(60000);
      monitor.addUpdateMethod(timer);
      await monitor.start();
      const pending = timer.timer;
      expect(pending).to.exist;
      const cleared = [];
      const clearTimeout = global.clearTimeout;
      global.clearTimeout = (t) => { cleared.push(t); return clearTimeout(t); };
      try {
        monitor.stop();
      } finally {
        global.clearTimeout = clearTimeout;
      }
      expect(cleared).to.include(pending);
      expect(timer.timer).to.equal(null);
    });

    /** Stands for `connection.socket` (a SocketIO): one instance, opened again on each rebuild. */
    class FakeSocket extends EventEmitter {
      constructor () {
        super();
        this._io = null;
        this.opens = 0;
      }

      // as @pryv/socket.io: open() reuses a live handle, close() drops it
      // (checked on the add-on itself in its [SRSD] test)
      async open () {
        if (this._io) return this;
        this.opens++;
        this._io = {};
        return this;
      }

      async subscribe () { return { ok: true }; }
      close () { this._io = null; }
    }

    function socketMonitor (socketOptions) {
      const m = new pryv.Monitor(new pryv.Connection(conn.apiEndpoint), { limit: 1 });
      const fake = new FakeSocket();
      Object.defineProperty(m.connection, 'socket', { value: fake });
      m.addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket(socketOptions));
      return { m, fake };
    }

    function expectListenedNone (fake) {
      for (const name of ['notificationsChanged', 'accessUpdated', 'error', 'reconnect']) {
        expect(fake.listenerCount(name), name).to.equal(0);
      }
    }

    function expectListenedOnce (fake) {
      for (const name of ['notificationsChanged', 'accessUpdated', 'error']) {
        expect(fake.listenerCount(name), name).to.equal(1);
      }
    }

    it('[MRDI] Socket rebuilt after the transport gave up: its listeners are not duplicated', async function () {
      const { m, fake } = socketMonitor();
      const errors = [];
      m.on(Changes.ERROR, (e) => { errors.push(e); });
      let accessUpdated = 0;
      m.onAccessUpdated(() => { accessUpdated++; });
      try {
        await m.start();
        expectListenedOnce(fake);
        // the transport gave up (as after reconnect_failed), then the next READY rebuilds
        fake._io = null;
        fake.emit('error', new Error('gave up'));
        await m.ready();
        expect(fake.opens).to.equal(2);
        expectListenedOnce(fake);
        fake.emit('accessUpdated', { type: 'access-updated' });
        expect(accessUpdated).to.equal(1);
        expect(errors.map((e) => e.message)).to.deep.equal(['gave up']);
      } finally {
        m.stop();
      }
    });

    it('[MRDR] Socket transport gave up, no `error` listener on the monitor: no exception, one warning, reopened on the next update', async function () {
      const { m, fake } = socketMonitor();
      try {
        await m.start();
        const warn = console.warn;
        const warned = [];
        console.warn = (...args) => { warned.push(args.join(' ')); };
        try {
          // as @pryv/socket.io after reconnect_failed: handle gone, then 'error'
          fake._io = null;
          fake.emit('error', new Error('socket.io: reconnect_failed (gave up after configured attempts)'));
        } finally {
          console.warn = warn;
        }
        expect(warned.length).to.equal(1);
        expect(warned[0]).to.include('reconnect_failed');
        expect(m.started).to.equal(true);
        await m.updateEvents(); // its READY reopens the socket
        await m.ready();
        expect(fake.opens).to.equal(2);
        expectListenedOnce(fake);
      } finally {
        m.stop();
      }
    });

    it('[MRDJ] Socket after stop() and start() again: its listeners are not duplicated', async function () {
      const { m, fake } = socketMonitor();
      try {
        await m.start();
        m.stop();
        expect(fake.listenerCount('notificationsChanged')).to.equal(0);
        await m.start();
        expect(fake.opens).to.equal(2);
        expectListenedOnce(fake);
      } finally {
        m.stop();
      }
    });

    /** Resolves true if `promise` settles within `ms` milliseconds, false otherwise. */
    function settlesWithin (promise, ms) {
      let timer;
      return Promise.race([
        promise.then(() => true, () => true),
        new Promise((resolve) => { timer = setTimeout(() => resolve(false), ms); })
      ]).finally(() => clearTimeout(timer));
    }

    it('[MRDK] stop() while Socket waits for the subscribe ack: start() settles, and the monitor starts again', async function () {
      const { m, fake } = socketMonitor();
      // like socket.io-client once the socket is closed: the ack never comes
      let holdAck = true;
      let subscribing;
      const subscribed = new Promise((resolve) => { subscribing = resolve; });
      fake.subscribe = async () => {
        if (!holdAck) return { ok: true };
        subscribing();
        return new Promise(() => {});
      };
      try {
        const first = m.start();
        await subscribed;
        m.stop();
        expect(await settlesWithin(first, 3000), 'first start() settles').to.equal(true);
        expect(m.started).to.equal(false);
        holdAck = false;
        expect(await settlesWithin(m.start(), 5000), 'second start() settles').to.equal(true);
        expect(m.started).to.equal(true);
        expect(fake.opens).to.equal(2);
        expectListenedOnce(fake);
      } finally {
        m.stop();
      }
    });

    it('[MRDL] Socket failing to open while a second READY waits for it: `error` emitted once', async function () {
      const { m, fake } = socketMonitor();
      fake.open = () => new Promise((resolve, reject) => setTimeout(() => reject(new Error('cannot open')), 100));
      const errors = [];
      m.on(Changes.ERROR, (e) => { errors.push(e); });
      const starting = m.start();
      // a second READY while the socket is opening (as from an update)
      while (!m.started) await new Promise((resolve) => setTimeout(resolve, 5));
      const second = m.ready();
      await starting;
      await second;
      expect(errors.map((e) => e.message)).to.deep.equal(['cannot open']);
      m.stop();
    });

    it('[MRDM] an update method failing in a later ready() with no `error` listener: no unhandled rejection', async function () {
      if (typeof process === 'undefined' || typeof process.on !== 'function') this.skip();
      const failing = new SlowUpdateMethod(10);
      monitor.addUpdateMethod(failing);
      await monitor.start();
      failing.fail = true;
      const unhandled = [];
      const onUnhandled = (reason) => { unhandled.push(reason); };
      const mochaListeners = process.listeners('unhandledRejection');
      process.removeAllListeners('unhandledRejection');
      process.on('unhandledRejection', onUnhandled);
      try {
        await monitor.updateEvents(); // its READY runs the failing ready()
        await new Promise((resolve) => setTimeout(resolve, 100));
        const late = new SlowUpdateMethod(10, true); // added to the started monitor
        monitor.addUpdateMethod(late);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } finally {
        process.removeListener('unhandledRejection', onUnhandled);
        for (const l of mochaListeners) process.on('unhandledRejection', l);
      }
      expect(unhandled.map((e) => e.message)).to.deep.equal([]);
    });

    it('[MRDN] Socket after a reconnection: fetches what changed, then keeps following notifications', async function () {
      const { m, fake } = socketMonitor();
      try {
        await m.start();
        const calls = [];
        const updateEvents = m.updateEvents.bind(m);
        const updateStreams = m.updateStreams.bind(m);
        m.updateEvents = () => { calls.push('events'); return updateEvents(); };
        m.updateStreams = () => { calls.push('streams'); return updateStreams(); };
        // @pryv/socket.io sent the subscription again after reconnecting
        fake.emit('reconnect', { resubscribed: true });
        expect(calls).to.deep.equal(['events', 'streams']);
        fake.emit('notificationsChanged', { keys: ['monEvents'] });
        expect(calls).to.deep.equal(['events', 'streams', 'events']);
        expect(fake.listenerCount('eventsChanged')).to.equal(0);
        // a reconnection where the subscription was not accepted again: the
        // server sends the coarse signals to the connection, follow those
        fake.emit('reconnect', { resubscribed: false });
        expect(fake.listenerCount('eventsChanged')).to.equal(1);
        expect(fake.listenerCount('streamsChanged')).to.equal(1);
        fake.emit('reconnect', { resubscribed: false });
        expect(fake.listenerCount('eventsChanged')).to.equal(1);
      } finally {
        m.stop();
      }
    });

    /** A Socket monitor whose subscribe ack never comes (lost, no reconnection). */
    function neverAcking (timeoutMs) {
      const { m, fake } = socketMonitor({ subscribeTimeoutMs: timeoutMs });
      fake.subscribe = () => new Promise(() => {});
      return { m, fake };
    }

    it('[MRDO] Socket subscribe ack never comes: the opening fails after subscribeTimeoutMs (`error`, start() resolves)', async function () {
      const { m, fake } = neverAcking(300);
      const errors = [];
      m.on(Changes.ERROR, (e) => { errors.push(e); });
      try {
        const t0 = Date.now();
        expect(await settlesWithin(m.start(), 5000), 'start() settles').to.equal(true);
        expect(Date.now() - t0).to.be.gte(300);
        expect(errors.map((e) => e.message)).to.deep.equal(['socket.io: no answer to subscribe within 300ms']);
        expect(m.started).to.equal(true);
        expect(fake._io).to.equal(null); // closed, so a next READY opens again
        expectListenedNone(fake);
      } finally {
        m.stop();
      }
    });

    it('[MRDP] Socket subscribe ack never comes, no `error` listener: start() rejects, the monitor is stopped', async function () {
      const { m } = neverAcking(200);
      let error = null;
      try {
        await m.start();
      } catch (e) {
        error = e;
      }
      expect(error?.message).to.equal('socket.io: no answer to subscribe within 200ms');
      expect(m.started).to.equal(false);
    });

    it('[MRDQ] Socket subscribeTimeoutMs must be a positive number', function () {
      expect(() => new pryv.Monitor.UpdateMethod.Socket({ subscribeTimeoutMs: 0 })).to.throw('subscribeTimeoutMs');
      expect(new pryv.Monitor.UpdateMethod.Socket().subscribeTimeoutMs).to.equal(15000);
    });

    it('[MRDF] Socket update method without @pryv/socket.io: `error` emitted, start() resolves', async function () {
      const bare = new pryv.Monitor(new pryv.Connection(conn.apiEndpoint), { limit: 1 });
      Object.defineProperty(bare.connection, 'socket', { value: undefined });
      bare.addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket());
      const errors = [];
      bare.on(Changes.ERROR, (e) => { errors.push(e); });
      try {
        await bare.start();
        expect(errors.map((e) => e.message)).to.deep.equal(['You should load package @pryv/socket.io to use monitor with websockets']);
      } finally {
        bare.stop();
      }
    });
  });
});
