/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const EventEmitter = require('events');
const UpdateMethod = require('./UpdateMethod/');
const _updateEvents = require('./lib/updateEvents');
const _updateStreams = require('./lib/updateStreams');
const Changes = require('./lib/Changes');

/**
 * Monitor changes on a Pryv.io account.
 * Emits events when data changes are detected.
 * @memberof pryv
 * @extends EventEmitter
 */
class Monitor extends EventEmitter {
  /**
   * Create a new Monitor
   * @param {(string|Connection)} apiEndpointOrConnection - API endpoint URL or Connection instance
   * @param {MonitorScope} [eventsGetScope={}] - The scope to monitor (events.get parameters)
   */
  constructor (apiEndpointOrConnection, eventsGetScope = {}) {
    super();
    // @ts-ignore - pryv is set at runtime by extendPryvMonitor
    if (!Monitor.pryv) {
      throw new Error('package \'@pryv/monitor\' must loaded after package \'pryv\'');
    }

    this.eventsGetScope = { // default eventsGetScope values
      fromTime: -Number.MAX_VALUE,
      toTime: Number.MAX_VALUE,
      modifiedSince: -Number.MAX_VALUE
    };
    Object.assign(this.eventsGetScope, eventsGetScope);

    // @ts-ignore - pryv is set at runtime
    if (apiEndpointOrConnection instanceof Monitor.pryv.Connection) {
      this.connection = apiEndpointOrConnection;
    } else {
      // @ts-ignore - pryv is set at runtime
      this.connection = new Monitor.pryv.Connection(apiEndpointOrConnection);
    }
    this.states = {
      started: false,
      starting: false, // in phase of initializing
      updatingEvents: false, // semaphore to prevent updating events in parallel
      updatingStreams: false // semaphore to prevent updating streams in parallel
    };
  }

  /**
   * Start the monitor and perform initial sync
   * @returns {Promise<Monitor>} Promise resolving to this Monitor instance
   */
  async start () {
    if (this.states.started || this.states.starting) return this;
    this.states.starting = true;
    await _updateStreams(this);
    await _updateEvents(this);
    // once initialized we for the eventsGetScope to request also deletions
    this.eventsGetScope.includeDeletions = true;
    this.eventsGetScope.state = 'all';

    this.states.starting = false;
    this.states.started = true;
    this.ready();
    return this;
  }

  /**
   * Request an events update according to the current scope
   * @returns {Promise<Monitor>} Promise resolving to this Monitor instance
   */
  async updateEvents () {
    if (!this.states.started) {
      throw new Error('Start Monitor before calling update Events');
    }
    if (this.states.updatingEvents) { // semaphore
      this.states.updateEventRequired = true;
      return this;
    }

    this.states.updatingEvents = true;
    try {
      this.states.updateEventRequired = false;
      await _updateEvents(this);
    } catch (e) {
      this.emit(Changes.ERROR, e);
    }
    this.states.updatingEvents = false;

    if (this.states.updateEventRequired) { // if another event update is required
      setTimeout(function () {
        this.updateEvents();
      }.bind(this), 1);
    } else {
      this.ready();
    }
    return this;
  }

  /**
   * Request a streams update
   * @returns {Promise<Monitor>} Promise resolving to this Monitor instance
   */
  async updateStreams () {
    if (!this.states.started) {
      throw new Error('Start Monitor before calling update Streams');
    }
    if (this.states.updatingStreams) { // semaphore
      this.states.updateStreamsRequired = true;
      return this;
    }

    this.states.updatingStreams = true;
    try {
      this.states.updateStreamsRequired = false;
      await _updateStreams(this);
    } catch (e) {
      this.emit(Changes.ERROR, e);
    }
    this.states.updatingStreams = false;

    if (this.states.updateStreamsRequired) { // if another streams update is required
      setTimeout(function () {
        this.updateStreams();
      }.bind(this), 1);
    } else {
      this.ready();
    }
    return this;
  }

  /**
   * @private
   * Called after init phase and each updateEvents
   * Advertise the update method or any listener that the Monitor is ready
   * for a next event update
   */
  ready () {
    if (!this.states.started) return; // it might be stoped
    this.emit(Changes.READY);
  }

  /**
   * Stop monitoring (no event will be fired anymore)
   * @returns {Monitor} this
   */
  stop () {
    if (!this.states.started) return this;
    if (this.states.starting) throw new Error('Process is starting, wait for the end of initialization to stop it');
    this.emit(Changes.STOP);
    this.states.started = false;
    return this;
  }

  /**
   * Used by updateMethods to be sure they can call updateXXX methods
   * @property {Boolean} started - true is monitor is started
   */
  get started () {
    return this.states.started;
  }

  /**
   * @private
   * Called by UpdateMethod to share cross references
   * Set a custom update method
   * @param {Object} updateMethod - the auto-update method
   * @returns {Monitor} this
   */
  addUpdateMethod (updateMethod) {
    updateMethod.setMonitor(this);
    return this;
  }
}

Monitor.UpdateMethod = UpdateMethod;
module.exports = Monitor;
