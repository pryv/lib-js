/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect, pryv */

// Pure unit check of the RFC 6750 Authorization header shape. The wire change
// (bare token -> `Bearer <token>`) is server-back-compatible; this asserts the
// prefix is present on both the GET and POST request paths.
describe('[CAUTH] Connection Authorization header', function () {
  let originalFetch;
  let captured;

  beforeEach(function () {
    captured = [];
    originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      captured.push({ url: String(url), headers: (init && init.headers) || {} });
      return new Response(JSON.stringify({ meta: { serverTime: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };
  });
  afterEach(function () { globalThis.fetch = originalFetch; });

  it('[CAU1] GET requests send `Authorization: Bearer <token>`', async function () {
    const conn = new pryv.Connection('https://TESTTOKEN@user.example.com/');
    await conn.get('events');
    expect(captured).to.have.length(1);
    expect(captured[0].headers.Authorization).to.equal('Bearer TESTTOKEN');
  });

  it('[CAU2] POST requests send `Authorization: Bearer <token>`', async function () {
    const conn = new pryv.Connection('https://TESTTOKEN@user.example.com/');
    await conn.post('events', { streamIds: ['x'], type: 'note/txt', content: 'hi' });
    expect(captured).to.have.length(1);
    expect(captured[0].headers.Authorization).to.equal('Bearer TESTTOKEN');
  });
});
