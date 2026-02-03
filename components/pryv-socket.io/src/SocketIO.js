/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const io = require('socket.io-client');
const { EventEmitter } = require('events');

const EVENTS = ['eventsChanged', 'streamsChanged', 'accessesChanged', 'disconnect', 'error'];

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
          // @ts-ignore - io is callable in socket.io-client
          this._io = io(socketEndpoint, { forceNew: true });

          // handle failure
          for (const errcode of ['connect_error', 'connection_failed', 'error', 'connection_timeout']) {
            const myCode = errcode;
            this._io.on(errcode, (e) => {
              if (!this.connecting) return; // do not care about errors if connected

              this._io = null;
              this.connecting = false;
              if (e === null) { e = myCode; }
              if (!(e instanceof Error)) { e = new Error(e); }

              try { this._io.close(); } catch (ex) { }
              return reject(e);
            });
          }

          // handle success
          this._io.on('connect', () => {
            this.connecting = false;
            registerListeners(this);
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
   * Close the socket
   */
  close () {
    checkOpen(this);
    this._io.close();
  }

  /**
   * Add listener for Socket.IO events
   * @param {('eventsChanged'|'streamsChanged'|'accessesChanged'|'disconnect'|'error')} eventName - The event to listen for
   * @param {Function} listener - The callback function
   * @returns {SocketIO} this
   */
  // @ts-ignore - overriding EventEmitter.on with restricted signature
  on (eventName, listener) {
    checkOpen(this);
    if (EVENTS.indexOf(eventName) < 0) {
      throw new Error('Unkown event [' + eventName + ']. Allowed events are: ' + EVENTS);
    }
    // @ts-ignore
    return super.on(eventName, listener);
  }

  /**
   * Identical to Connection.api() but using Socket.IO transport
   * @param {Array<MethodCall>} arrayOfAPICalls - Array of Method Calls
   * @param {Function} [progress] - Return percentage of progress (0 - 100)
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
}

// private method to fence the usage of socket before being open
function checkOpen (socket) {
  if (!socket._io) throw new Error('Initialize socket.io with connection.socket.open() before');
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
