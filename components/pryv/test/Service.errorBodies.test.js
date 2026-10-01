/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, afterEach, expect, pryv */

/**
 * [SEBX] A malformed server answer never lands in the error message.
 *
 * `login`, `mfaVerify` and `startAccessRequest` throw when a 2xx answer lacks
 * what they need. The answer may hold secrets (a misplaced token) or the
 * request's data, and error messages end up in logs and on screen: it rides
 * on `innerObject` only. `fetch` is stubbed: no server.
 */

const SECRET = 'S3CRET-in-the-answer';
const SERVICE_INFO = {
  register: 'https://reg.seb.test.local/',
  access: 'https://access.seb.test.local/access/',
  api: 'https://{username}.seb.test.local/',
  name: 'Test'
};

describe('[SEBX] malformed answers stay out of error messages', function () {
  let realFetch;

  /** Service info on GET; `postBody` with HTTP 200 on every POST. */
  function stubFetch (postBody) {
    realFetch = global.fetch;
    global.fetch = async function (url, options) {
      if (options?.method === 'POST') return { ok: true, status: 200, json: async () => postBody };
      return { ok: true, status: 200, json: async () => SERVICE_INFO };
    };
  }

  afterEach(function () {
    if (realFetch) global.fetch = realFetch;
    realFetch = null;
  });

  async function caught (promise) {
    try {
      await promise;
    } catch (e) {
      return e;
    }
    throw new Error('expected a rejection');
  }

  it('[SEB1] login: an answer without token', async () => {
    const body = { session: SECRET };
    stubFetch(body);
    const service = new pryv.Service('https://reg.seb.test.local/service/info');
    const e = await caught(service.login('alice', 'pw', 'app-id'));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('Invalid login response');
    expect(e.message).to.not.include(SECRET);
    expect(e.innerObject).to.deep.equal(body);
  });

  it('[SEB2] mfaVerify: an answer without token', async () => {
    const body = { session: SECRET };
    stubFetch(body);
    const service = new pryv.Service('https://reg.seb.test.local/service/info');
    const e = await caught(service.mfaVerify('alice', 'mfa-token', '123456'));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('did not return a token');
    expect(e.message).to.not.include(SECRET);
    expect(e.innerObject).to.deep.equal(body);
  });

  it('[SEB3] startAccessRequest: an answer without key or poll', async () => {
    const body = { requestedPermissions: [{ streamId: SECRET, level: 'read' }] };
    stubFetch(body);
    const service = new pryv.Service('https://reg.seb.test.local/service/info');
    const e = await caught(service.startAccessRequest({ requestingAppId: 'app-id', requestedPermissions: [] }));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('Invalid access-request response');
    expect(e.message).to.not.include(SECRET);
    expect(e.innerObject).to.deep.equal(body);
  });
});
