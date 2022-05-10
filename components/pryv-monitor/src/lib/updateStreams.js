/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const Changes = require('./Changes');

module.exports = async function _updateStreams (monitor) {
  try {
    const result = await monitor.connection.get('streams');
    if (!result.streams) { throw new Error('Invalid response ' + JSON.streams(result)); }
    monitor.emit(Changes.STREAMS, result.streams);
  } catch (e) {
    monitor.emit(Changes.ERROR, e);
  }
};
