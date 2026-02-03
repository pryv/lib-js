/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const Changes = require('../lib/Changes');
/**
 * Base class for update methods used by Monitor.
 * Subclass this to create custom update strategies.
 * @memberof pryv.Monitor
 */
class UpdateMethod {
  /**
   * Assign a Monitor to this updater.
   * Usually called by the monitor itself on monitor.addUpdateMethod()
   * @param {Monitor} monitor - The monitor to attach to
   */
  setMonitor (monitor) {
    if (this.monitor) {
      throw new Error('An update Method can be assigned to one monitor only');
    }
    this.monitor = monitor;
    monitor.on(Changes.READY, this.ready.bind(this));
    monitor.on(Changes.STOP, this.stop.bind(this));
    if (monitor.started) {
      this.ready();
    }
  }

  /**
   * Called when all update tasks are done and monitor is ready for next update.
   * Override in subclasses to implement custom behavior.
   * @returns {Promise<void>}
   */
  async ready () { }

  /**
   * Called when monitor is stopped. Override to clean up resources.
   * @returns {Promise<void>}
   */
  async stop () { }
}

module.exports = UpdateMethod;
