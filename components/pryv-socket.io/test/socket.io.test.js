/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, beforeEach, afterEach, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

require('@pryv/socket.io')(pryv);

let conn = null;
const testStreamId = 'socket-test';

describe('[SKIX] Socket.IO', function () {
  this.timeout(20000);
  let apiEndpoint;
  let apiEndpointBogusToken;
  let apiEndpointBogusUsername;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    apiEndpoint = testData.apiEndpointWithToken;
    apiEndpointBogusToken = pryv.Service.buildAPIEndpoint(testData.serviceInfo, testData.username, 'toto');
    apiEndpointBogusUsername = pryv.Service.buildAPIEndpoint(testData.serviceInfo, 'totototototo', testData.token);
  });

  before(async () => {
    conn = new pryv.Connection(apiEndpoint);
    const res = await conn.api([{
      method: 'streams.create',
      params: {
        id: testStreamId,
        name: testStreamId
      }
    }]);
    expect(res[0]).to.exist;
    if (res[0].stream) return;
    expect(res[0].error).to.exist;
    expect(res[0].error.id).to.equal('item-already-exists');
  });

  describe('[SIEX] init on invalid endpoint', () => {
    it('[SIEA] Should throw an error "Not Found" or ENOTFOUND when user is not known', async () => {
      conn = new pryv.Connection(apiEndpointBogusUsername);
      try {
        await conn.socket.open();
      } catch (e) {
        if (e.message === 'Not Found' || e.message.startsWith('getaddrinfo ENOTFOUND') || e.message === 'fetch failed' || e.message.includes('Unknown user')) {
          return;
        }
        if (typeof document !== 'undefined') { // in browser
          console.warn('Error found by messages are not consistent among browsers:', e.message);
          return;
        }
        throw new Error('Error message should be NotFound or ENOTFOUND and received: ' + e.message);
      }
      throw new Error('Should throw an error');
    });

    it('[SIEB] Should throw an error "Unauthorized" when token is invalid', async () => {
      conn = new pryv.Connection(apiEndpointBogusToken);
      try {
        await conn.socket.open();
      } catch (e) {
        return expect(e.message).to.include('Cannot find access from token.');
      }
      throw new Error('Should throw an error');
    });
  });

  describe('[SIVX] init on valid endpoint', () => {
    beforeEach(async () => {
      conn = new pryv.Connection(apiEndpoint);
    });

    afterEach(() => {
      conn = null;
    });

    it('[SIVA] Should throw an error if conn.socket.api() is called before being open()', async () => {
      try {
        await conn.socket.api([{ method: 'events.get', params: {} }]);
      } catch (e) {
        return expect(e.message).to.equal('Initialize socket.io with connection.socket.open() before');
      }
      throw new Error('Should throw an error');
    });

    it('[SIVB] Should throw an error if conn.socket.on() is called before being open()', async () => {
      try {
        await conn.socket.on('eventsChanged');
      } catch (e) {
        return expect(e.message).to.equal('Initialize socket.io with connection.socket.open() before');
      }
      throw new Error('Should throw an error');
    });

    it('[SIVC] Correct initialization should return socket instance', async () => {
      const socket = await conn.socket.open();
      expect(socket._io).to.exist;
    });
  });

  describe('[SAPX] socket.api', () => {
    before(async () => {
      conn = new pryv.Connection(apiEndpoint);
      await conn.socket.open();
    });

    after(() => {
      conn = null;
    });

    it('[SAPA] Handle correctly batch calls', async () => {
      const res = await conn.socket.api([{ method: 'streams.get', params: {} }]);
      expect(res[0]).to.exist;
      expect(res[0].streams).to.exist;
    });

    // we don't test further .api() as it relies on the implementation of pryv.Connection
  });

  describe('[SRSX] subscriptions kept for reconnections (no server)', () => {
    /** A SocketIO on a stand-in transport that records what is emitted, acks by hand. */
    function socketOnFakeTransport () {
      const socket = new pryv.Connection('https://tok@alice.example.test/').socket;
      const sent = [];
      socket._io = { emit: (name, payload, cb) => { sent.push({ name, payload, cb }); }, close () {} };
      const reconnects = [];
      socket.on('reconnect', (info) => { reconnects.push(info); });
      return { socket, sent, reconnects };
    }

    it('[SRSA] an ack lost with the disconnection: the call resolves with the re-subscription ack', async () => {
      const { socket, sent, reconnects } = socketOnFakeTransport();
      const subscribing = socket.subscribe({ key: 'k1', kind: 'events', query: { streams: ['s'] } });
      socket._onReconnect(); // the ack of the first subscribe never came
      expect(sent.map((s) => s.name)).to.deep.equal(['subscribe', 'subscribe']);
      expect(sent[1].payload).to.deep.equal({ scopes: { k1: { kind: 'events', query: { streams: ['s'] } } } });
      sent[1].cb(null, { ok: true, keys: ['k1'] });
      expect(await subscribing).to.deep.equal({ ok: true, keys: ['k1'] });
      expect(reconnects).to.deep.equal([{ resubscribed: true }]);
      sent[0].cb(null, { ok: true, keys: ['k1'] }); // a late ack changes nothing
    });

    it('[SRSB] only the accepted, not unsubscribed scopes are sent again', async () => {
      const { socket, sent, reconnects } = socketOnFakeTransport();
      const a = socket.subscribe({ scopes: { a: { kind: 'events', query: {} }, b: { kind: 'streams', query: {} } } });
      sent[0].cb(null, { ok: true, keys: ['a', 'b'] });
      await a;
      const refused = socket.subscribe({ key: 'c', kind: 'events', query: {} });
      sent[1].cb({ id: 'invalid-parameters-format' });
      expect((await refused).ok).to.equal(false);
      socket.unsubscribe({ key: 'b' });
      sent[2].cb(null, { ok: true });
      socket._onReconnect();
      expect(sent[3].payload).to.deep.equal({ scopes: { a: { kind: 'events', query: {} } } });
      sent[3].cb(null, { ok: true, keys: ['a'] });
      expect(reconnects).to.deep.equal([{ resubscribed: true }]);
    });

    it('[SRSC] no subscription: `reconnect` with resubscribed false, nothing sent', () => {
      const { socket, sent, reconnects } = socketOnFakeTransport();
      socket._onReconnect();
      expect(sent).to.deep.equal([]);
      expect(reconnects).to.deep.equal([{ resubscribed: false }]);
    });

    it('[SRSD] close(): a waiting subscribe() resolves, and nothing is kept for a next opening', async () => {
      const { socket, sent } = socketOnFakeTransport();
      const subscribing = socket.subscribe({ key: 'k1', kind: 'events', query: {} });
      socket.close();
      expect((await subscribing).ok).to.equal(false);
      expect(socket._scopes.size).to.equal(0);
      expect(sent.length).to.equal(1);
    });
  });

  describe('[SNTX] notification', () => {
    before(async () => {
      conn = new pryv.Connection(apiEndpoint);
      await conn.socket.open();
    });

    after(() => {
      conn = null;
    });

    it('[SNTA] Fails on requesting an invalid notifcation', async () => {
      try {
        conn.socket.on('Bogus', () => {});
      } catch (e) {
        return expect(e.message).to.equal('Unkown event [Bogus]. Allowed events are: eventsChanged,streamsChanged,accessesChanged,accessUpdated,notificationsChanged,disconnect,error,reconnect');
      }
      throw new Error('Should fail');
    });

    it('[SNTB] Catches eventChanges', (done) => {
      function onEventChanged () {
        return done();
      }
      conn.socket.on('eventsChanged', onEventChanged);
      conn.api([{ method: 'events.create', params: { type: 'note/txt', streamIds: [testStreamId], content: 'hello' } }]);
    });

    it('[SNTC] Catches streamChanges', (done) => {
      function onStreamChange () {
        return done();
      }
      conn.socket.on('streamsChanged', onStreamChange);
      conn.api([{ method: 'streams.create', params: { id: cuid(), name: cuid(), parentId: testStreamId } }]);
    });

    it('[SNTE] after a reconnection: subscriptions sent again, `reconnect` emitted, notifications relayed once', async function () {
      this.timeout(30000);
      const key = 'sk' + cuid().slice(0, 8);
      const ack = await conn.socket.subscribe({ key, kind: 'events', query: { streams: [testStreamId] } });
      if (!ack || ack.ok !== true) this.skip(); // server without scoped notifications
      const notified = [];
      conn.socket.on('notificationsChanged', (payload) => { if (payload?.keys?.includes(key)) notified.push(payload); });
      const reconnected = new Promise((resolve) => conn.socket.on('reconnect', resolve));
      // a reconnection: a new server-side connection, without the subscription
      conn.socket._io.disconnect();
      conn.socket._io.connect();
      const info = await reconnected;
      expect(info).to.deep.equal({ resubscribed: true });
      await conn.api([{ method: 'events.create', params: { type: 'note/txt', streamIds: [testStreamId], content: 'after reconnect' } }]);
      const deadline = Date.now() + 10000;
      while (notified.length === 0 && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 100));
      expect(notified.length, 'notified after the reconnection').to.be.gt(0);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      expect(notified.length, 'relayed once').to.equal(1);
      await conn.socket.unsubscribe({ key });
    });

    /** Keep this test the last on of this sequence */
    it('[SNTD] Catches disconnect', (done) => {
      function onDisconnect (reason) {
        expect(reason).to.equal('io client disconnect');
        return done();
      }
      conn.socket.on('disconnect', onDisconnect);
      conn.socket.close();
    });
  });
});
