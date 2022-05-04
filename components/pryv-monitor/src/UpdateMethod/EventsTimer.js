const UpdateMethod = require('./UpdateMethod');

class EventsTimer extends UpdateMethod {
  /**
   * @param {Number} updateRateMS - the refresh rate in milliseconds
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
