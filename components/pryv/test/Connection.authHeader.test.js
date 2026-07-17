/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect, pryv */

// Pure unit check of the Authorization header shape. The API expects the bare
// access token (optionally suffixed with a caller id) in the Authorization
// header — NOT an RFC 6750 `Bearer <token>` scheme. Older/released cores parse
// the header by splitting on the first space, so a `Bearer ` prefix would be
// taken as the token and break auth; the bare token is what every core version
// accepts. This asserts no scheme prefix is added on the GET or POST path.
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

  it('[CAU1] GET requests send the bare token (no scheme prefix)', async function () {
    const conn = new pryv.Connection('https://TESTTOKEN@user.example.com/');
    await conn.get('events');
    expect(captured).to.have.length(1);
    expect(captured[0].headers.Authorization).to.equal('TESTTOKEN');
  });

  it('[CAU2] POST requests send the bare token (no scheme prefix)', async function () {
    const conn = new pryv.Connection('https://TESTTOKEN@user.example.com/');
    await conn.post('events', { streamIds: ['x'], type: 'note/txt', content: 'hi' });
    expect(captured).to.have.length(1);
    expect(captured[0].headers.Authorization).to.equal('TESTTOKEN');
  });
});
