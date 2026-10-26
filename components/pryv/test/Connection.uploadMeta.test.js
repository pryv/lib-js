/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect, pryv, Blob, FormData */

// Offline: `fetch` is stubbed. Every attachment upload method must refine
// `deltaTime` from the response's `meta.serverTime`, like any other API call.
describe('[CUPM] Connection attachment uploads refine deltaTime', function () {
  const SERVER_AHEAD = 1000; // seconds the stubbed server clock is ahead
  const isNode = (typeof window === 'undefined');
  let originalFetch;
  let posts;

  beforeEach(function () {
    posts = [];
    originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      posts.push({ url: String(url), method: init && init.method });
      const body = {
        event: { id: 'cevt', attachments: [] },
        meta: { serverTime: Date.now() / 1000 + SERVER_AHEAD }
      };
      return new Response(JSON.stringify(body), {
        status: 201,
        headers: { 'content-type': 'application/json' }
      });
    };
  });
  afterEach(function () { globalThis.fetch = originalFetch; });

  function newConnection () {
    const conn = new pryv.Connection('https://TESTTOKEN@user.example.com/');
    expect(conn.deltaTime).to.equal(0);
    return conn;
  }

  function expectDeltaRefined (conn, res) {
    expect(res.event.id).to.equal('cevt');
    expect(posts).to.have.length(1);
    expect(posts[0].url).to.equal('https://user.example.com/events');
    expect(conn.deltaTime).to.be.within(SERVER_AHEAD - 5, SERVER_AHEAD + 5);
  }

  it('[CUPM1] Node only: createEventWithFile', async function () {
    if (!isNode) { this.skip(); }
    const conn = newConnection();
    const filePath = require('path').join(__dirname, 'Y.png');
    const res = await conn.createEventWithFile({ type: 'picture/attached', streamIds: ['data'] }, filePath);
    expectDeltaRefined(conn, res);
  });

  it('[CUPM2] createEventWithFileFromBuffer', async function () {
    const conn = newConnection();
    const data = new Blob(['Hello'], { type: 'text/plain' });
    const res = await conn.createEventWithFileFromBuffer({ type: 'file/attached', streamIds: ['data'] }, data, 'Hello.txt');
    expectDeltaRefined(conn, res);
  });

  it('[CUPM3] createEventWithFormData', async function () {
    const conn = newConnection();
    const formData = new FormData();
    formData.append('file', new Blob(['Hello'], { type: 'text/plain' }), 'Hello.txt');
    const res = await conn.createEventWithFormData({ type: 'file/attached', streamIds: ['data'] }, formData);
    expectDeltaRefined(conn, res);
  });
});
