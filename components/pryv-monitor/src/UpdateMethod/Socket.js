
const UpdateMethod = require('./UpdateMethod');
const Changes = require('../lib/Changes');

class Socket extends UpdateMethod {
  async ready () {
    if (this.socket) return;
    if (!this.monitor.connection.socket) {
      throw new Error('You should load package @pryv/socket.io to use monitor with websockets');
    }
    this.socket = await this.monitor.connection.socket.open();
    this.socket.on('eventsChanged', () => { this.monitor.updateEvents(); });
    this.socket.on('streamsChanged', () => { this.monitor.updateStreams(); });
    /* eslint-disable-next-line node/handle-callback-err */
    this.socket.on('error', (error) => { this.monitor.emit(Changes.ERROR.error); });
  }

  async stop () {
    if (!this.socket) return;
    try { this.socket.close(); } catch (e) { }
    this.socket = null;
  }
}
module.exports = Socket;
