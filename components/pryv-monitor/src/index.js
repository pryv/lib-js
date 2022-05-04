const Monitor = require('./Monitor');
const Changes = require('./lib/Changes');

Monitor.Changes = Changes;

/**
 * Load Monitor capabilities onto Pryv
 * @param {Pryv} Pryv - Pryv lib-js library @see https://github.com/pryv/lib-js
 */
module.exports = function(Pryv) {
  console.log('Pryv version', Pryv.version);
  // check version here
  if (Pryv.Monitor) {
    throw new Error('Monitor already loaded');
  }
  // sharing cross references
  Pryv.Monitor = Monitor;
  Monitor.Pryv = Pryv;
  return Monitor;
}

/**
 * @typedef Pryv.Monitor.Changes
 * @property {string} EVENT "event" fired on new or changed event
 * @property {string} EVENT_DELETE "eventDelete"
 * @property {string} STREAMS "streams"
 * @property {string} ERROR "error"
 * @property {string} READY "ready"
 * @property {string} STOP "stop"
 */


/**
 * A scope corresponding to EventGetParameters @see https://l.rec.la:4443/reference#get-events
 * Property `limit` cannot be specified;
 * @typedef {Object} Pryv.Monitor.Scope
 * @property {timestamp} [fromTime=TIMERANGE_MIN] (in seconds)
 * @property {timestamp} [toTime=TIMERANGE_MAX] (in seconds)
 * @property {string[]} [streams] - array of streamIds
 * @property {string[]} [tags] - array of tags
 * @property {string[]} [types] - array of EventTypes
 * @property {boolean} [running]
 * @property {boolean} [sortAscending] - If true, events will be sorted from oldest to newest. ! with monitors, this will only determine the way monitor will receive events on each update. The order they will be notified to listener cannot be guranted.
 * @property {('default'|'trashed'|'all')} [state]
 * @property {boolean} [includeDeletions]
 * @property {timestamp} modifiedSince - (in seconds) only events modified after this date
 */

