/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

require('./load-helpers');
const Changes = require('../src/lib/Changes');
const updateStreams = require('../src/lib/updateStreams');

/**
 * [MUSX] A `streams.get` answer without streams is reported without its
 * content in the message (stream names and clientData), on `innerObject`
 * instead. A fake monitor: no server.
 */
describe('[MUSX] updateStreams with an invalid answer', function () {
  it('[MUS1] emits an error whose message leaves the answer out', async function () {
    const SECRET = 'S3CRET-stream-name';
    const answer = { error: { id: 'unknown-error', message: 'x' }, streams_partial: [{ name: SECRET }] };
    const emitted = [];
    const monitor = {
      connection: { get: async () => answer },
      emit: (type, value) => emitted.push({ type, value })
    };
    await updateStreams(monitor);
    expect(emitted).to.have.length(1);
    expect(emitted[0].type).to.equal(Changes.ERROR);
    expect(emitted[0].value.message).to.equal('Invalid streams.get answer: no streams');
    expect(emitted[0].value.message).to.not.include(SECRET);
    expect(emitted[0].value.innerObject).to.equal(answer);
  });
});
