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
  async ready () {
    if (this.socket) return;
    // @ts-ignore - socket is added by @pryv/socket.io extension
    if (!this.monitor.connection.socket) {
      throw new Error('You should load package @pryv/socket.io to use monitor with websockets');
    }
    // @ts-ignore - socket is added by @pryv/socket.io extension
    this.socket = await this.monitor.connection.socket.open();

    // Scoped notifications (opt-in): register this monitor's scope so the server
    // wakes us only when a matching change occurs, delivered as a single
    // `notificationsChanged({ keys })`. Because a scoped connection opts out of
    // the coarse broadcasts server-side, we register BOTH an events scope (so
    // `updateEvents` fires) and a streams scope (so `updateStreams` fires).
    // Older servers reject `subscribe` (the wildcard treats it as an unknown
    // method); we then fall back to the legacy coarse signals.
    const onEvents = () => { this.monitor.updateEvents(); };
    const onStreams = () => { this.monitor.updateStreams(); };
    this.socket.on('notificationsChanged', (payload) => {
      const keys = (payload && payload.keys) || [];
      if (keys.includes('monEvents')) onEvents();
      if (keys.includes('monStreams')) onStreams();
    });
    const scope = this.monitor.eventsGetScope || {};
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
      this.socket.on('eventsChanged', onEvents);
      this.socket.on('streamsChanged', onStreams);
    }
    // Re-emit the server's fine-grained `accessUpdated` event on the
    // Monitor itself so consumers can subscribe via
    // `monitor.onAccessUpdated(handler)`. The underlying SocketIO has
    // already busted the connection's accessInfo cache; the payload
    // carries the new composite accessId + serial for fine-grained
    // reactions.
    this.socket.on('accessUpdated', (payload) => {
      this.monitor.emit('accessUpdated', payload);
    });
    this.socket.on('error', (error) => {
      this.monitor.emit(Changes.ERROR, error);
      // If the underlying socket.io-client transport has been torn down
      // (i.e. SocketIO emitted 'error' after reconnect_failed), drop our
      // reference so a future Changes.READY can rebuild instead of
      // short-circuiting on the cached, dead handle.
      if (this.socket && !this.socket._io) {
        this.socket = null;
      }
    });
  }

  async stop () {
    if (!this.socket) return;
    try { this.socket.close(); } catch (e) { }
    this.socket = null;
  }
}
module.exports = Socket;
