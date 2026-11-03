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
    // On each READY, run ready() and hand its promise to the monitor, so
    // monitor.start() resolves only once this update method is ready.
    // A failure goes to the monitor's `error` event.
    const onReady = () => {
      const task = new Promise((resolve) => { resolve(this.ready()); })
        .catch((e) => { monitor.emit(Changes.ERROR, e); });
      // `_addReadyTask` is internal to the Monitor (not typed)
      (/** @type {any} */ (monitor))._addReadyTask(task);
      return task;
    };
    // @ts-ignore - Changes.READY and Changes.STOP are valid event names
    monitor.on(Changes.READY, onReady);
    // @ts-ignore
    monitor.on(Changes.STOP, this.stop.bind(this));
    if (monitor.started) {
      // added to a started monitor: nobody awaits this ready(); a failure was
      // emitted as `error` (dropped if nobody listens)
      onReady().catch(() => {});
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
