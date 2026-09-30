/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, afterEach, expect, pryv */

/**
 * [PUKX] Polling an auth request by key reaches the core that holds it.
 *
 * On a multi-core platform a pending auth request lives on the core that
 * created it, and the server answers the access request with a poll URL on
 * that core, while the service's `access` URL may reach any core. Polling by
 * key must use the server-issued URL when this process started the request.
 * Observed: the URLs actually fetched (a stubbed global fetch), not only the
 * result.
 */

const pollUrls = require('../src/lib/pollUrls');
const AuthController = require('../src/Auth/AuthController');
const utils = require('../src/utils');

const SERVICE_INFO = {
  register: 'https://reg.mc.test.local/',
  access: 'https://access.mc.test.local/access/',
  api: 'https://{username}.mc.test.local/',
  name: 'Test'
};

let keyCounter = 0;
function freshKey () { return 'puk-key-' + (++keyCounter); }
function corePoll (key) { return 'https://core-a.mc.test.local/reg/access/' + key; }

describe('[PUKX] polling an auth request by key', function () {
  let realFetch;
  let gets;

  /** service-info, POST <access> -> NEED_SIGNIN with a core poll URL, GET -> `pollBody` */
  function stubFetch (key, pollBody) {
    realFetch = global.fetch;
    gets = [];
    global.fetch = async function (url, options) {
      const u = String(url);
      if (options?.method === 'POST' && u === SERVICE_INFO.access) {
        return { ok: true, status: 201, json: async () => ({ status: 'NEED_SIGNIN', key, poll: corePoll(key), authUrl: 'https://ui.mc.test.local/access?key=' + key, poll_rate_ms: 1000 }) };
      }
      if (u.includes('/access/')) {
        gets.push(u);
        return { ok: true, status: 200, json: async () => pollBody };
      }
      return { ok: true, status: 200, json: async () => SERVICE_INFO };
    };
  }

  afterEach(function () {
    if (realFetch) global.fetch = realFetch;
    realFetch = null;
  });

  it('[PUK1] remembers valid entries only, keeps a bounded number and expires them', function () {
    const realNow = Date.now;
    pollUrls.clear();
    try {
      pollUrls.remember('puk1-a', 'https://core-a.example.com/reg/access/puk1-a');
      pollUrls.remember('puk1-b', 'javascript:alert(1)');
      pollUrls.remember(null, 'https://core-a.example.com/reg/access/x');
      expect(pollUrls.lookup('puk1-a')).to.equal('https://core-a.example.com/reg/access/puk1-a');
      expect(pollUrls.lookup('puk1-b')).to.equal(null);
      for (let i = 0; i < pollUrls.MAX_ENTRIES; i++) pollUrls.remember('puk1-fill-' + i, 'https://c.example.com/' + i);
      expect(pollUrls.lookup('puk1-a')).to.equal(null); // oldest dropped
      expect(pollUrls.lookup('puk1-fill-' + (pollUrls.MAX_ENTRIES - 1))).to.equal('https://c.example.com/' + (pollUrls.MAX_ENTRIES - 1));
      const later = realNow() + pollUrls.TTL_MS + 1000;
      Date.now = () => later;
      expect(pollUrls.lookup('puk1-fill-' + (pollUrls.MAX_ENTRIES - 1))).to.equal(null); // expired
    } finally {
      Date.now = realNow;
      pollUrls.clear();
    }
  });

  it('[PUK2] pollAccessRequest(key) and connectFromKey(key) poll the core URL the server issued', async function () {
    const key = freshKey();
    stubFetch(key, { status: 'ACCEPTED', username: 'alice', apiEndpoint: 'https://tok@alice.mc.test.local/', token: 'tok' });
    const service = new pryv.Service(null, SERVICE_INFO);
    const env = await service.startAccessRequest({ requestingAppId: 'puk', requestedPermissions: [] });
    expect(env.poll).to.equal(corePoll(key));

    await service.pollAccessRequest(key);
    // a fresh Service, as pryv.connectFromKey(key, url) builds one
    const connection = await new pryv.Service(null, SERVICE_INFO).connectFromKey(key);
    expect(gets).to.deep.equal([corePoll(key), corePoll(key)]);
    expect(connection.apiEndpoint).to.equal('https://tok@alice.mc.test.local/');
  });

  it('[PUK3] a key this process never saw falls back to access + key', async function () {
    const key = freshKey();
    stubFetch(key, { status: 'NEED_SIGNIN' });
    await new pryv.Service(null, SERVICE_INFO).pollAccessRequest(key);
    expect(gets).to.deep.equal([SERVICE_INFO.access + key]);
  });

  it('[PUK4] a sign-in started by the button is remembered for connectFromKey', async function () {
    const key = freshKey();
    const { fetchPost, fetchGet } = utils;
    utils.fetchPost = async () => ({ response: { ok: true }, body: { status: 'NEED_SIGNIN', key, poll: corePoll(key), poll_rate_ms: 1, authUrl: 'https://ui.mc.test.local/access?key=' + key } });
    utils.fetchGet = async () => ({ response: { status: 200 }, body: { status: 'REFUSED' } });
    const service = { infoSync: () => SERVICE_INFO, assets: async () => ({}) };
    const auth = new AuthController({ authRequest: { requestingAppId: 'puk4', requestedPermissions: [] } }, service);
    auth.serviceInfo = SERVICE_INFO;
    try {
      await auth.startAuthRequest();
    } finally { utils.fetchPost = fetchPost; utils.fetchGet = fetchGet; }
    expect(pollUrls.lookup(key)).to.equal(corePoll(key));
  });
});
