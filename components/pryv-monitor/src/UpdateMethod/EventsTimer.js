/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const UpdateMethod = require('./UpdateMethod');

/**
 * Update method that polls for event changes at a fixed interval.
 * @memberof pryv.Monitor
 * @extends UpdateMethod
 */
class EventsTimer extends UpdateMethod {
  /**
   * @param {number} updateRateMS - The refresh rate in milliseconds (must be > 1)
   */
  constructor (updateRateMS) {
    super();
    this.timer = null;
    if (!updateRateMS || isNaN(updateRateMS) || updateRateMS < 1) {
      throw new Error('Monitor timer refresh rate is not valid. It should be a number > 1');
    }
    this.updateRateMS = updateRateMS;
  }

  async ready () {
    if (this.timer != null) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.monitor.started) this.monitor.updateEvents();
    }, this.updateRateMS);
  }
}

module.exports = EventsTimer;
