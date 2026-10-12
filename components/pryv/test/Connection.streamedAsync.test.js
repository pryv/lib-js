/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect, pryv */

// getEventsStreamed with an ASYNC per-event callback (e.g. one that decrypts
// each event): the call must resolve only once every callback has finished,
// and reject when one of them fails. A served body is streamed in small
// chunks so events are parsed one by one.
describe('[CSTA] Connection.getEventsStreamed with async callbacks', function () {
  let originalFetch;

  function serve (body, chunkSize = 7) {
    globalThis.fetch = async () => {
      const bytes = new TextEncoder().encode(JSON.stringify(body));
      let pos = 0;
      const stream = new ReadableStream({
        pull (controller) {
          if (pos >= bytes.length) { controller.close(); return; }
          controller.enqueue(bytes.slice(pos, pos + chunkSize));
          pos += chunkSize;
        }
      });
      return new Response(stream, { status: 200, headers: { 'content-type': 'application/json' } });
    };
  }

  const events = [1, 2, 3].map((i) => ({ id: 'e' + i, streamIds: ['s'], type: 'note/txt', content: 'n' + i, time: i }));

  beforeEach(function () { originalFetch = globalThis.fetch; });
  afterEach(function () { globalThis.fetch = originalFetch; });

  it('[CST1] waits for every async callback before resolving', async function () {
    serve({ events, meta: { serverTime: 1 } });
    const conn = new pryv.Connection('https://TOKEN@user.example.com/');
    const seen = [];
    const res = await conn.getEventsStreamed({ streams: ['s'] }, async (event) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      seen.push(event.id);
    });
    expect(seen.sort()).to.deep.equal(['e1', 'e2', 'e3']);
    expect(res.eventsCount).to.equal(3);
  });

  it('[CST2] rejects when an async callback rejects', async function () {
    serve({ events, meta: { serverTime: 1 } });
    const conn = new pryv.Connection('https://TOKEN@user.example.com/');
    let error = null;
    try {
      await conn.getEventsStreamed({ streams: ['s'] }, async (event) => {
        if (event.id === 'e2') throw new Error('cannot decrypt e2');
      });
    } catch (e) { error = e; }
    expect(error).to.be.an('error');
    expect(error.message).to.equal('cannot decrypt e2');
  });

  it('[CST4] event deletions also wait for the async callback', async function () {
    serve({ events, eventDeletions: [{ id: 'd1', deleted: 5 }], meta: { serverTime: 1 } });
    const conn = new pryv.Connection('https://TOKEN@user.example.com/');
    const seen = [];
    const res = await conn.getEventsStreamed({ streams: ['s'], includeDeletions: true }, async (item) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      seen.push(item.id);
    });
    expect(seen.sort()).to.deep.equal(['d1', 'e1', 'e2', 'e3']);
    expect(res.eventsCount).to.equal(3);
    expect(res.eventDeletionsCount).to.equal(1);
  });

  it('[CST5] every callback has settled before the rejection, and a bare thenable is awaited', async function () {
    serve({ events, meta: { serverTime: 1 } });
    const conn = new pryv.Connection('https://TOKEN@user.example.com/');
    const done = [];
    let error = null;
    try {
      await conn.getEventsStreamed({ streams: ['s'] }, (event) => {
        if (event.id === 'e1') return Promise.reject(new Error('first'));
        // a thenable without catch/finally
        return { then (resolve) { setTimeout(() => { done.push(event.id); resolve(); }, 20); } };
      });
    } catch (e) { error = e; }
    expect(error && error.message).to.equal('first');
    expect(done.sort()).to.deep.equal(['e2', 'e3']);
  });

  it('[CST3] a synchronous callback behaves as before', async function () {
    serve({ events, meta: { serverTime: 1 } });
    const conn = new pryv.Connection('https://TOKEN@user.example.com/');
    const seen = [];
    const res = await conn.getEventsStreamed({ streams: ['s'] }, (event) => { seen.push(event.id); });
    expect(seen).to.deep.equal(['e1', 'e2', 'e3']);
    expect(res.eventsCount).to.equal(3);
  });
});
