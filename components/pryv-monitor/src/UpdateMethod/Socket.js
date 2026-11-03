/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

const UpdateMethod = require('./UpdateMethod');
const Changes = require('../lib/Changes');

/**
 * Update method that uses @pryv/socket.io events for real-time updates.
 * Requires @pryv/socket.io to be loaded.
 * @memberof pryv.Monitor
 * @extends UpdateMethod
 */
class Socket extends UpdateMethod {
  /**
   * Open the socket and subscribe to the monitor's scope; resolves once
   * subscribed, then up to date (see `_open()`). A call while that is in
   * progress shares it.
   * @returns {Promise<void>}
   */
  async ready () {
    if (this.socket) return;
    if (this._opening == null) {
      this._opening = this._open().finally(() => { this._opening = null; });
    }
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
    const ack = await this.socket.subscribe({
      scopes: {
        monEvents: { kind: 'events', query: eventsQuery },
        monStreams: { kind: 'streams', query: streamsQuery }
      }
    });
    if (!ack || ack.ok !== true) {
      // Server does not support scoped subscriptions — use coarse signals.
      this._listen('eventsChanged', onEvents);
      this._listen('streamsChanged', onStreams);
    }
    // Re-emit the server's fine-grained `accessUpdated` event on the
    // Monitor itself so consumers can subscribe via
    // `monitor.onAccessUpdated(handler)`. The underlying SocketIO has
    // already busted the connection's accessInfo cache; the payload
    // carries the new composite accessId + serial for fine-grained
    // reactions.
    this._listen('accessUpdated', (payload) => {
      this.monitor.emit('accessUpdated', payload);
    });
    this._listen('error', (error) => {
      // If the underlying socket.io-client transport has been torn down
      // (i.e. SocketIO emitted 'error' after reconnect_failed), drop our
      // reference so a future Changes.READY can rebuild instead of
      // short-circuiting on the cached, dead handle.
      // `_io` is the SocketIO instance's internal transport handle (not typed)
      if (this.socket && !(/** @type {any} */ (this.socket))._io) {
        this.socket = null;
      }
      this.monitor.emit(Changes.ERROR, error);
    });
    // A change made between the monitor's last fetch and the subscription
    // above sent no notification: fetch what changed since, once.
    if (this.monitor.started) await this.monitor.updateEvents();
  }

  async stop () {
    this._removeListeners();
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
