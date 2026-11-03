/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const io = require('socket.io-client');
const { EventEmitter } = require('events');

// events relayed from the server-side socket
const EVENTS = ['eventsChanged', 'streamsChanged', 'accessesChanged', 'accessUpdated', 'notificationsChanged', 'disconnect', 'error'];
// events a listener can be added for: the relayed ones, and `reconnect`
// (emitted by this object once the subscriptions are sent again after an
// automatic reconnection)
const LISTENABLE_EVENTS = EVENTS.concat(['reconnect']);

/**
 * Socket.IO transport for a Connection.
 * Use connection.socket to access the instance associated with a Connection.
 * @memberof pryv
 * @extends EventEmitter
 */
class SocketIO extends EventEmitter {
  /**
   * @param {Connection} connection - The connection to bind to
   */
  constructor (connection) {
    super();
    /** @type {Connection} */
    this.connection = connection;
    /** @type {boolean} */
    this.connecting = false;
    this._io = null;
    /**
     * @private
     * Scoped subscriptions requested on this socket (key → `{ kind, query }`),
     * sent again after a reconnection.
     * @type {Map<string, Object>}
     */
    this._scopes = new Map();
    /**
     * @private
     * Resolvers of `subscribe()` calls still waiting for their ack: an ack
     * lost with a disconnection is replaced by the one of the re-subscription.
     * @type {Set<(ack: Object) => void>}
     */
    this._pendingSubscribes = new Set();
  }

  /**
   * Open the Socket.IO stream
   * @throws {Error} On connection failures
   * @returns {Promise<SocketIO>} Promise resolving to this SocketIO instance
   */
  async open () {
    return new Promise((resolve, reject) => {
      if (this._io) return resolve(this);
      if (this.connecting) return reject(new Error('open() process in course'));
      this.connecting = true;

      this.connection.username()
        .then(username => {
          const socketEndpoint = this.connection.endpoint + username + '?auth=' + this.connection.token;
          // Cap reconnects so a server-side outage can't drive a runaway loop.
          // socket.io-client default is reconnectionAttempts: Infinity, max delay 5s.
          // With these settings, a stuck client gives up after ~10 attempts spread
          // over ~1 minute (with randomization), then surfaces 'error' to consumers.
          this._io = this._createIo(socketEndpoint, {
            forceNew: true,
            transports: ['websocket'],
            reconnectionAttempts: 10,
            reconnectionDelayMax: 60000,
            randomizationFactor: 0.5
          });
          const ioSocket = this._io;

          // Terminal failure: socket.io-client gave up reconnecting (emitted by
          // its Manager, `socket.io`, not by the socket). Tear down our handle
          // and surface 'error' so consumers (e.g. Monitor) can clean up
          // instead of leaving a zombie socket reference.
          ioSocket.io.on('reconnect_failed', () => {
            if (this._io !== ioSocket) return; // closed or replaced meanwhile
            this._io = null;
            this.connecting = false;
            try { ioSocket.close(); } catch (ex) { }
            this._scopes.clear();
            settlePendingSubscribes(this, { ok: false, error: new Error('socket closed') });
            const error = new Error('socket.io: reconnect_failed (gave up after configured attempts)');
            // without a listener, EventEmitter throws 'error' events, here
            // inside socket.io-client's reconnection timer: an uncaught exception
            if (this.listenerCount('error') > 0) {
              this.emit('error', error);
            } else {
              console.warn('@pryv/socket.io: ' + error.message + '; the socket is closed (listen to "error" on connection.socket to handle it)');
            }
          });

          // handle failure
          for (const errcode of ['connect_error', 'connection_failed', 'error', 'connection_timeout']) {
            const myCode = errcode;
            ioSocket.on(errcode, (e) => {
              if (!this.connecting) return; // do not care about errors if connected

              // close the failed socket, or socket.io-client keeps retrying it
              try { ioSocket.close(); } catch (ex) { }
              this._io = null;
              this.connecting = false;
              if (e === null) { e = myCode; }
              if (!(e instanceof Error)) { e = new Error(e); }
              return reject(e);
            });
          }

          // handle success
          // socket.io-client emits `connect` again after each automatic
          // reconnection: that is a new server-side connection, without the
          // scoped subscriptions of the previous one
          let connected = false;
          this._io.on('connect', () => {
            if (connected) {
              this._onReconnect();
              return;
            }
            connected = true;
            this.connecting = false;
            registerListeners(this);
            // When the server emits `accessUpdated` (fine-grained event
            // fired after every successful `accesses.update`), bust the
            // connection's `accessInfo` cache so the next read picks up
            // the new permissions / serial. Best-effort: a failed
            // refresh leaves the previous cached value intact.
            this._io.on('accessUpdated', () => {
              this.connection.accessInfo(true).catch(() => { /* swallow */ });
            });
            resolve(this);
          });
        })
        .catch(e => {
          this._io = null;
          this.connecting = false;
          return reject(e);
        });
    });
  }

  /**
   * @private
   * Create the socket.io-client socket (a seam for tests).
   * @param {string} endpoint
   * @param {Object} options
   * @returns {any} the socket.io-client socket
   */
  _createIo (endpoint, options) {
    // @ts-ignore - io is callable in socket.io-client
    return io(endpoint, options);
  }

  /**
   * Close the socket
   */
  close () {
    checkOpen(this);
    this._io.close();
    // the server drops the subscriptions with the connection; a waiting
    // subscribe() gets no ack any more
    this._scopes.clear();
    settlePendingSubscribes(this, { ok: false, error: new Error('socket closed') });
  }

  /**
   * Add listener for Socket.IO events
   * @param {('eventsChanged'|'streamsChanged'|'accessesChanged'|'accessUpdated'|'notificationsChanged'|'disconnect'|'error'|'reconnect')} eventName - The event to listen for
   * @param {Function} listener - The callback function
   * @returns {SocketIO} this
   */
  // @ts-ignore - overriding EventEmitter.on with restricted signature
  on (eventName, listener) {
    checkOpen(this);
    if (LISTENABLE_EVENTS.indexOf(eventName) < 0) {
      throw new Error('Unkown event [' + eventName + ']. Allowed events are: ' + LISTENABLE_EVENTS);
    }
    // @ts-ignore
    return super.on(eventName, listener);
  }

  /**
   * Identical to Connection.api() but using Socket.IO transport
   * @param {Array<MethodCall>} arrayOfAPICalls - Array of Method Calls
   * @param {(percentage: number) => void} [progress] - Return percentage of progress (0 - 100)
   * @returns {Promise<Array>} Promise to Array of results matching each method call in order
   */
  async api (arrayOfAPICalls, progress) {
    checkOpen(this);
    function httpHandler (batchCall) {
      return new Promise((resolve, reject) => {
        this._io.emit('callBatch', batchCall, function (err, res) {
          if (err) return reject(err);
          resolve(res);
        });
      });
    }
    return await this.connection._chunkedBatchCall(arrayOfAPICalls, progress, httpHandler.bind(this));
  }

  /**
   * Register scoped notification subscriptions on this connection. Matched
   * changes are delivered as `notificationsChanged({ keys })`. Resolves the
   * server ack `{ ok, keys }`, or `{ ok: false }` when the server does not
   * support scoped notifications (so callers can fall back to coarse events).
   *
   * The subscriptions are kept by this object and sent again after an
   * automatic reconnection (the server forgets them with the connection),
   * then `reconnect` is emitted. A call whose ack was lost with a
   * disconnection resolves with the ack of that re-subscription.
   * @param {object} payload - `{ key, kind, query }` or `{ scopes: { key: { kind, query } } }`
   * @returns {Promise<object>}
   */
  subscribe (payload) {
    checkOpen(this);
    /** @type {Array<[string, Object]>} */
    const requested = [];
    if (payload != null && payload.scopes != null && typeof payload.scopes === 'object') {
      for (const [key, spec] of Object.entries(payload.scopes)) requested.push([key, spec]);
    } else if (payload != null && payload.key != null) {
      const { key, ...spec } = payload;
      requested.push([key, spec]);
    }
    for (const [key, spec] of requested) this._scopes.set(key, spec);
    return new Promise((resolve) => {
      const done = (ack) => {
        if (!this._pendingSubscribes.delete(done)) return; // already settled
        if (ack == null || ack.ok !== true) {
          // refused (or not supported): nothing to send again after a reconnection
          for (const [key, spec] of requested) {
            if (this._scopes.get(key) === spec) this._scopes.delete(key);
          }
        }
        resolve(ack);
      };
      this._pendingSubscribes.add(done);
      this._io.emit('subscribe', payload, (err, res) => done(err != null ? { ok: false, error: err } : (res || { ok: false })));
    });
  }

  /**
   * Remove scoped subscriptions: `{ key }`, `{ keys: [...] }`, or `{ all: true }`.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  unsubscribe (payload) {
    checkOpen(this);
    if (payload != null && payload.all === true) this._scopes.clear();
    else if (payload != null && Array.isArray(payload.keys)) for (const k of payload.keys) this._scopes.delete(k);
    else if (payload != null && payload.key != null) this._scopes.delete(payload.key);
    return new Promise((resolve) => {
      this._io.emit('unsubscribe', payload, (err, res) => resolve(err != null ? { ok: false, error: err } : res));
    });
  }

  /**
   * List the scopes currently registered on this connection.
   * @returns {Promise<object>} `{ scopes: { key: { kind, query } } }`
   */
  getSubscriptions () {
    checkOpen(this);
    return new Promise((resolve) => {
      this._io.emit('getSubscriptions', null, (err, res) => resolve(err != null ? { scopes: {} } : res));
    });
  }

  /**
   * @private
   * After an automatic reconnection: send the scoped subscriptions again (the
   * new server-side connection has none), then emit `reconnect` with
   * `{ resubscribed }` (true when there were subscriptions and the server
   * accepted them again) so consumers can fetch what changed while disconnected.
   */
  _onReconnect () {
    const io = this._io;
    // subscribe() calls made before this reconnection: their ack may have been
    // lost with the disconnection, and their scopes are in the re-subscription
    const waiting = [...this._pendingSubscribes];
    const finish = (ack) => {
      if (this._io !== io) return; // closed meanwhile
      for (const done of waiting) done(ack);
      this.emit('reconnect', { resubscribed: ack.ok === true });
    };
    if (this._scopes.size === 0) return finish({ ok: false });
    const scopes = Object.fromEntries(this._scopes);
    io.emit('subscribe', { scopes }, (err, res) => finish(err != null ? { ok: false, error: err } : (res || { ok: false })));
  }
}

// private method to fence the usage of socket before being open
function checkOpen (socket) {
  if (!socket._io) throw new Error('Initialize socket.io with connection.socket.open() before');
}

// resolve every subscribe() still waiting for its ack with `ack`
function settlePendingSubscribes (socket, ack) {
  for (const done of [...socket._pendingSubscribes]) done(ack);
}

// private method to register to all events for an open socket
// and relay it.
function registerListeners (socket) {
  for (const event of EVENTS) {
    socket._io.on(event, (...args) => {
      socket.emit(event, ...args);
    });
  }
}

module.exports = function (Connection) {
  Object.defineProperty(Connection.prototype, 'socket', {
    get: function () {
      if (this._socket) return this._socket;
      this._socket = new SocketIO(this);
      return this._socket;
    }
  });
};
