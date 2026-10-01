/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const Changes = require('./Changes');

module.exports = async function _updateStreams (monitor) {
  try {
    const result = await monitor.connection.get('streams');
    if (!result.streams) {
      // The answer rides on `innerObject`, never in the message (it holds stream data).
      throw Object.assign(new Error('Invalid streams.get answer: no streams'), { innerObject: result });
    }
    monitor.emit(Changes.STREAMS, result.streams);
  } catch (e) {
    monitor.emit(Changes.ERROR, e);
  }
};
