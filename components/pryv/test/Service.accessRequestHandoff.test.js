/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, afterEach, expect, pryv */

/**
 * [ARQH] Credential hand-off (shared-secret delivery) in `connectFromKey`.
 *
 * When an access request asked for `credentialHandoff: 'shared-secret'`, the
 * ACCEPTED poll body carries a one-time `handoff` key and a token-less
 * `apiEndpoint` instead of the token. `connectFromKey` must redeem that key
 * once, build a token-bearing `Connection`, and reuse the cached result on a
 * second call (the one-time secret cannot be redeemed twice). A legacy inline
 * body must keep working unchanged.
 *
 * Driven through a stubbed global fetch: what is tested is this library's
 * handling of the two ACCEPTED shapes.
 */

const SERVICE_INFO = {
  register: 'https://reg.test.local/',
  access: 'https://reg.test.local/access',
  api: 'https://{username}.test.local/',
  name: 'Test'
};

let keyCounter = 0;
function freshKey () { return 'poll-key-' + (++keyCounter); }

describe('[ARQH] auth-request credential hand-off', function () {
  let realFetch;
  let retrieveCalls;
  let retrievePosts;

  /**
   * Stub fetch: serve service-info, answer the poll GET with `pollBody`, and
   * answer `shared-secrets/retrieve` with `retrieveResponse` (counting calls).
   */
  function stubFetch (pollBody, retrieveResponse) {
    realFetch = global.fetch;
    retrieveCalls = 0;
    retrievePosts = [];
    global.fetch = async function (url, options) {
      const u = String(url);
      if (u.includes('shared-secrets/retrieve')) {
        retrieveCalls++;
        retrievePosts.push(JSON.parse(options.body));
        return {
          ok: retrieveResponse.ok !== false,
          status: retrieveResponse.status || 200,
          json: async () => retrieveResponse.body
        };
      }
      if (u.includes('/access')) { // the poll GET
        return { ok: true, status: 200, json: async () => pollBody };
      }
      return { ok: true, status: 200, json: async () => SERVICE_INFO }; // service-info
    };
  }

  afterEach(function () {
    if (realFetch) global.fetch = realFetch;
    realFetch = null;
  });

  it('[SARH1] redeems a hand-off ACCEPTED body once and builds a token-bearing connection', async function () {
    const key = freshKey();
    stubFetch(
      {
        status: 'ACCEPTED',
        username: 'alice',
        apiEndpoint: 'https://alice.test.local/', // token-less
        handoff: { type: 'shared-secret', key: 'evt1.' + 'a'.repeat(40) }
      },
      { body: { secret: { username: 'alice', token: 'tok-123', apiEndpoint: 'https://alice.test.local/' } } }
    );

    const service = new pryv.Service('https://reg.test.local/service/info');
    await service.info();
    const conn = await service.connectFromKey(key);

    expect(retrieveCalls).to.equal(1);
    expect(retrievePosts[0].key).to.equal('evt1.' + 'a'.repeat(40));
    expect(conn.token).to.equal('tok-123');
    expect(conn.apiEndpoint).to.contain('tok-123@');
    expect(conn.apiEndpoint).to.contain('alice.test.local');
  });

  it('[SARH2] redeems only once across two connectFromKey calls for the same key (module cache)', async function () {
    const key = freshKey();
    stubFetch(
      {
        status: 'ACCEPTED',
        username: 'bob',
        apiEndpoint: 'https://bob.test.local/',
        handoff: { type: 'shared-secret', key: 'evt2.' + 'b'.repeat(40) }
      },
      { body: { secret: { username: 'bob', token: 'tok-xyz', apiEndpoint: 'https://bob.test.local/' } } }
    );

    // Module-level convenience builds a fresh Service each call; the shared
    // cache is what stops a second redeem of the one-shot secret.
    const c1 = await pryv.connectFromKey(key, 'https://reg.test.local/service/info');
    const c2 = await pryv.connectFromKey(key, 'https://reg.test.local/service/info');

    expect(retrieveCalls).to.equal(1);
    expect(c1.token).to.equal('tok-xyz');
    expect(c2.token).to.equal('tok-xyz');
  });

  it('[SARH3] leaves a legacy inline ACCEPTED body unchanged (no retrieve)', async function () {
    const key = freshKey();
    stubFetch(
      {
        status: 'ACCEPTED',
        username: 'carol',
        token: 'tok-inline',
        apiEndpoint: 'https://tok-inline@carol.test.local/'
      },
      { body: { secret: {} } }
    );

    const service = new pryv.Service('https://reg.test.local/service/info');
    await service.info();
    const conn = await service.connectFromKey(key);

    expect(retrieveCalls).to.equal(0);
    expect(conn.token).to.equal('tok-inline');
  });

  it('[SARH4] surfaces a consumed/expired hand-off as a PryvError telling the caller to restart', async function () {
    const key = freshKey();
    stubFetch(
      {
        status: 'ACCEPTED',
        username: 'dan',
        apiEndpoint: 'https://dan.test.local/',
        handoff: { type: 'shared-secret', key: 'evt4.' + 'd'.repeat(40) }
      },
      { ok: false, status: 403, body: { error: { id: 'forbidden', message: 'used', data: { id: 'shared-secret-unavailable' } } } }
    );

    const service = new pryv.Service('https://reg.test.local/service/info');
    await service.info();
    let caught;
    try {
      await service.connectFromKey(key);
    } catch (e) { caught = e; }
    expect(caught).to.be.instanceof(pryv.PryvError);
    expect(caught.id).to.equal('credential-handoff-failed');
  });
});
