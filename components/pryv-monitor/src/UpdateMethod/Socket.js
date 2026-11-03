/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

const UpdateMethod = require('./UpdateMethod');
const Changes = require('../lib/Changes');

const DEFAULT_SUBSCRIBE_TIMEOUT_MS = 15000;

/**
 * Update method that uses @pryv/socket.io events for real-time updates.
 * Requires @pryv/socket.io to be loaded.
 * @memberof pryv.Monitor
 * @extends UpdateMethod
 */
class Socket extends UpdateMethod {
  /**
   * @param {Object} [options]
   * @param {number} [options.subscribeTimeoutMs=15000] - how long to wait for
   *   the server to acknowledge the subscription before the opening fails
   */
  constructor (options = {}) {
    super();
    const timeout = options.subscribeTimeoutMs;
    if (timeout != null && !(typeof timeout === 'number' && timeout > 0)) {
      throw new Error('Monitor socket subscribeTimeoutMs should be a number > 0');
    }
    this.subscribeTimeoutMs = timeout ?? DEFAULT_SUBSCRIBE_TIMEOUT_MS;
  }

  /**
   * Open the socket and subscribe to the monitor's scope; resolves once
   * subscribed, then up to date (see `_open()`). A call while that is in
   * progress waits for it; its failure is reported once, by the call that
   * started it.
   * @returns {Promise<void>}
   */
  async ready () {
    if (this.socket) return;
    if (this._opening != null) return this._opening.then(() => {}, () => {});
    this._opening = this._open().finally(() => { this._opening = null; });
    return this._opening;
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async _open () {
    // @ts-ignore - socket is added by @pryv/socket.io extension
    if (!this.monitor.connection.socket) {
      throw new Error('You should load package @pryv/socket.io to use monitor with websockets');
    }
    // @ts-ignore - socket is added by @pryv/socket.io extension
    const socket = await this.monitor.connection.socket.open();
    if (!this.monitor.started) { // stopped while opening
      try { socket.close(); } catch (e) { }
      return;
    }
    this.socket = socket;
    // a rebuild (after the transport gave up) or a restart reuses the same
    // `connection.socket`: drop the listeners of the previous opening first
    this._removeListeners();

    this._listen('error', (error) => {
      // If the underlying socket.io-client transport has been torn down
      // (i.e. SocketIO emitted 'error' after reconnect_failed), drop our
      // reference so a future Changes.READY can rebuild instead of
      // short-circuiting on the cached, dead handle (and end a pending
      // subscribe wait: its ack will not come).
      // `_io` is the SocketIO instance's internal transport handle (not typed)
      if (this.socket && !(/** @type {any} */ (this.socket))._io) {
        this.socket = null;
        if (this._abortSubscribe != null) this._abortSubscribe(null);
      }
      this.monitor.emit(Changes.ERROR, error);
    });

    // Scoped notifications (opt-in): register this monitor's scope so the server
    // wakes us only when a matching change occurs, delivered as a single
    // `notificationsChanged({ keys })`. Because a scoped connection opts out of
    // the coarse broadcasts server-side, we register BOTH an events scope (so
    // `updateEvents` fires) and a streams scope (so `updateStreams` fires).
    // Older servers reject `subscribe` (the wildcard treats it as an unknown
    // method); we then fall back to the legacy coarse signals.
    const onEvents = () => { this.monitor.updateEvents(); };
    const onStreams = () => { this.monitor.updateStreams(); };
    this._listen('notificationsChanged', (payload) => {
      const keys = (payload && payload.keys) || [];
      if (keys.includes('monEvents')) onEvents();
      if (keys.includes('monStreams')) onStreams();
    });
    const scope = this.monitor.eventsGetScope || {};
    /** @type {Record<string, unknown>} */
    const eventsQuery = {};
    for (const f of ['streams', 'types', 'content', 'clientData']) {
      if (scope[f] != null) eventsQuery[f] = scope[f];
    }
    const streamsQuery = scope.streams != null ? { streams: scope.streams } : {};
    // Once the socket is closed (by stop()) the ack never comes (socket.io-client
    // drops ack callbacks on disconnect): stop() ends the wait instead. An ack
    // lost with a brief disconnection is replaced by the one of the
    // re-subscription @pryv/socket.io sends on reconnection; without a
    // reconnection in time the opening fails after `subscribeTimeoutMs`.
    const stopped = new Promise((resolve) => { this._abortSubscribe = resolve; });
    let timer;
    const timedOut = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('socket.io: no answer to subscribe within ' + this.subscribeTimeoutMs + 'ms')), this.subscribeTimeoutMs);
    });
    let ack;
    try {
      ack = await Promise.race([
        this.socket.subscribe({
          scopes: {
            monEvents: { kind: 'events', query: eventsQuery },
            monStreams: { kind: 'streams', query: streamsQuery }
          }
        }),
        stopped,
        timedOut
      ]);
    } catch (e) {
      // not subscribed: drop this opening so a next READY opens again
      if (this.socket === socket) {
        this._removeListeners();
        this.socket = null;
        try { socket.close(); } catch (ex) { }
      }
      throw e;
    } finally {
      clearTimeout(timer);
      this._abortSubscribe = null;
    }
    if (this.socket !== socket) return; // stopped (or torn down) while subscribing
    let coarse = false;
    const useCoarseSignals = () => {
      coarse = true;
      this._listen('eventsChanged', onEvents);
      this._listen('streamsChanged', onStreams);
    };
    // Server does not support scoped subscriptions — use coarse signals.
    if (!ack || ack.ok !== true) useCoarseSignals();
    // After an automatic reconnection @pryv/socket.io has sent the
    // subscription again (the server forgets it with the old connection);
    // nothing was notified while disconnected: fetch what changed.
    this._listen('reconnect', (info) => {
      if (!this.monitor.started) return;
      if (!coarse && !(info && info.resubscribed)) useCoarseSignals();
      this.monitor.updateEvents();
      this.monitor.updateStreams();
    });
    // Re-emit the server's fine-grained `accessUpdated` event on the
    // Monitor itself so consumers can subscribe via
    // `monitor.onAccessUpdated(handler)`. The underlying SocketIO has
    // already busted the connection's accessInfo cache; the payload
    // carries the new composite accessId + serial for fine-grained
    // reactions.
    this._listen('accessUpdated', (payload) => {
      this.monitor.emit('accessUpdated', payload);
    });
    // A change made between the monitor's last fetch and the subscription
    // above sent no notification: fetch what changed since, once. Best effort
    // for the "before start() resolves" part: if an events update is already
    // running, updateEvents() only queues a re-run and returns at once (the
    // running update and the re-run still cover the gap).
    if (this.monitor.started) await this.monitor.updateEvents();
  }

  async stop () {
    this._removeListeners();
    if (this._abortSubscribe != null) this._abortSubscribe(null);
    if (!this.socket) return;
    try { this.socket.close(); } catch (e) { }
    this.socket = null;
  }

  /**
   * @private
   * Listen to `eventName` on the current socket, remembering the listener
   * so `_removeListeners()` can drop it.
   * @param {string} eventName
   * @param {(...args: any[]) => void} listener
   */
  _listen (eventName, listener) {
    const socket = this.socket;
    // @ts-ignore - eventName is one of the SocketIO events
    socket.on(eventName, listener);
    if (this._listeners == null) this._listeners = [];
    this._listeners.push({ socket, eventName, listener });
  }

  /**
   * @private
   * Remove the listeners added by `_listen()`.
   */
  _removeListeners () {
    if (this._listeners == null) return;
    for (const { socket, eventName, listener } of this._listeners) {
      socket.removeListener(eventName, listener);
    }
    this._listeners = null;
  }
}
module.exports = Socket;
