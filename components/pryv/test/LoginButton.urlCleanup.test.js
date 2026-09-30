/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, beforeEach, after, afterEach, expect, JSDOM */

const LoginButton = require('../src/Browser/LoginButton');
const SharedSecrets = require('../src/SharedSecrets');
const handoff = require('../src/lib/handoff');
const pollUrls = require('../src/lib/pollUrls');
const utils = require('../src/utils');

// Node only (JSDOM): these tests drive finishAuthProcessAfterRedirection
// against a page URL of their own. A return is honoured only for the auth
// request the page started, which the button keeps in sessionStorage under
// `<cookieKey>-authflow` before navigating to the auth page; `seedFlow`
// stands for that start.
const COOKIE_KEY = 'pryv-libjs-test-app';
const THIS = { _cookieKey: COOKIE_KEY };

function seedFlow (key, poll, cookieKey = COOKIE_KEY) {
  global.window.sessionStorage.setItem(cookieKey + '-authflow', JSON.stringify({ key, poll, authUrl: 'https://ui.test.local/access/access.html?key=' + key }));
}

function storedFlow (cookieKey = COOKIE_KEY) {
  const raw = global.window.sessionStorage.getItem(cookieKey + '-authflow');
  return raw == null ? null : JSON.parse(raw);
}

describe('[LBRU] LoginButton URL cleanup after redirect', function () {
  const PAGE_URL = 'http://localhost/app?x=1&prYvpoll=http%3A%2F%2Flocalhost%2Fpoll%2Fkey123&prYvstatus=ACCEPTED';
  const GLOBALS = ['document', 'window', 'location', 'navigator'];
  let saved;
  let originalFetchGet;

  before(function () {
    if (typeof JSDOM === 'undefined') this.skip();
    // Always our own page: reusing a DOM left by another file would test that
    // page's URL, not PAGE_URL.
    saved = {};
    for (const name of GLOBALS) {
      saved[name] = Object.getOwnPropertyDescriptor(global, name);
    }
    const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: PAGE_URL });
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
    global.navigator = { userAgent: 'Safari' };
    originalFetchGet = utils.fetchGet;
    utils.fetchGet = async () => ({ body: { status: 'ACCEPTED' } });
  });

  after(() => {
    utils.fetchGet = originalFetchGet;
    if (saved == null) return;
    for (const name of GLOBALS) {
      if (saved[name]) Object.defineProperty(global, name, saved[name]);
      else delete global[name];
    }
  });

  it('[LBR1] strips consumed prYv* params from the visible URL', async () => {
    seedFlow('key123', 'http://localhost/poll/key123');
    const authController = { serviceInfo: {} };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(authController.state).to.eql({ status: 'ACCEPTED' });
    expect(global.window.location.href).to.equal('http://localhost/app?x=1');
  });
});

/** Shared JSDOM page + stubs for the redirect-return suites below. */
function redirectReturnFixture () {
  const GLOBALS = ['document', 'window', 'location', 'navigator'];
  const f = { fetchCalls: [], retrieveCalls: [] };
  let saved;
  let originalFetchGet;
  let originalRetrieve;

  f.setPage = function (url) {
    const dom = new JSDOM('<!DOCTYPE html><body></body>', { url });
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
  };

  /** Poll answers `body` (and `response`), recording every URL fetched. */
  f.poll = function (body, response) {
    utils.fetchGet = async (url) => {
      f.fetchCalls.push(url);
      return { response, body: typeof body === 'function' ? body() : body };
    };
  };

  f.retrieve = function (answer) {
    SharedSecrets.retrieve = async (apiEndpoint, key) => {
      f.retrieveCalls.push({ apiEndpoint, key });
      return answer();
    };
  };

  before(function () {
    if (typeof JSDOM === 'undefined') this.skip();
    saved = {};
    for (const name of GLOBALS) saved[name] = Object.getOwnPropertyDescriptor(global, name);
    Object.defineProperty(global, 'navigator', { value: { userAgent: 'Safari' }, configurable: true, writable: true });
    originalFetchGet = utils.fetchGet;
    originalRetrieve = SharedSecrets.retrieve;
  });

  beforeEach(() => {
    f.fetchCalls.length = 0;
    f.retrieveCalls.length = 0;
  });

  afterEach(() => {
    utils.fetchGet = originalFetchGet;
    SharedSecrets.retrieve = originalRetrieve;
    handoff.cacheClear();
  });

  after(() => {
    if (saved == null) return;
    for (const name of GLOBALS) {
      if (saved[name]) Object.defineProperty(global, name, saved[name]);
      else delete global[name];
    }
  });

  return f;
}

function fakeService (serviceInfo) {
  return {
    infoSync: () => serviceInfo,
    assets: async () => ({
      loginButtonLoadCSS: async () => {},
      loginButtonGetMessages: async () => ({ LOADING: 'Loading...' })
    })
  };
}

/**
 * [LBRH] Return from a sign-in by redirection when the core delivered the
 * credentials through a one-time shared secret: the ACCEPTED poll body has a
 * token-less apiEndpoint and a `handoff` key, which must be redeemed exactly
 * as the popup (polling) path does. Observed: the state handed to the button
 * (what ends up in the cookie) and the retrieve call.
 */
describe('[LBRH] LoginButton redirect return with credential hand-off', function () {
  const f = redirectReturnFixture();
  const HANDOFF_BODY = () => ({
    status: 'ACCEPTED',
    username: 'alice',
    apiEndpoint: 'https://alice.test.local/',
    handoff: { type: 'shared-secret', key: 'evt1.' + 'a'.repeat(40) }
  });

  it('[LBH1] redeems the hand-off: token-bearing state, key kept as the flow key', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey1&prYvstatus=ACCEPTED');
    seedFlow('flowkey1', 'https://reg.test.local/access/flowkey1');
    f.poll(HANDOFF_BODY);
    f.retrieve(() => ({ secret: { username: 'alice', token: 'tok-123', apiEndpoint: 'https://alice.test.local/' } }));
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);

    const state = authController.state;
    expect(state.status).to.equal('ACCEPTED');
    expect(state.token).to.equal('tok-123');
    expect(state.apiEndpoint).to.equal('https://tok-123@alice.test.local/');
    expect(state.handoff).to.equal(undefined);
    expect(state.profile.apiEndpoint).to.equal('https://tok-123@alice.test.local/');
    expect(f.retrieveCalls).to.have.length(1);
    expect(authController._authFlowKey).to.equal('flowkey1');
    // cached under the flow key: a later connectFromKey reuses it
    expect(handoff.cacheGet('flowkey1').token).to.equal('tok-123');
    expect(global.window.location.href).to.equal('http://localhost/app');
  });

  it('[LBH2] takes the flow key from pryvKey when present', async () => {
    f.setPage('http://localhost/app?pryvKey=flowkey2');
    seedFlow('flowkey2', 'https://reg.test.local/access/flowkey2');
    f.poll(HANDOFF_BODY);
    f.retrieve(() => ({ secret: { username: 'alice', token: 'tok-456', apiEndpoint: 'https://alice.test.local/' } }));
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);

    expect(authController.state.token).to.equal('tok-456');
    expect(authController._authFlowKey).to.equal('flowkey2');
  });

  it('[LBH4] end to end: real button + controller store a usable sign-in, keep the legacy listener shape, sign-out clears the cache', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey4&prYvkey=flowkey4&prYvstatus=ACCEPTED');
    seedFlow('flowkey4', 'https://reg.test.local/access/flowkey4', 'pryv-libjs-lbh4-app');
    f.poll(HANDOFF_BODY);
    f.retrieve(() => ({ secret: { username: 'alice', token: 'tok-789', apiEndpoint: 'https://alice.test.local/' } }));
    const external = [];
    const loginBtn = new LoginButton({
      onStateChange: (s) => external.push(s),
      authRequest: { requestingAppId: 'lbh4-app', requestedPermissions: [], returnURL: 'self#' }
    }, fakeService({ access: 'https://reg.test.local/access/', api: 'https://{username}.test.local/', name: 'Test' }));
    await loginBtn.init();

    expect(loginBtn.auth.state.status).to.equal('ACCEPTED');
    expect(loginBtn.auth.state.apiEndpoint).to.equal('https://tok-789@alice.test.local/');
    // redirect apps receive the legacy shape: credentials included, no `key`
    const authorized = external.filter((s) => s.status === 'ACCEPTED');
    expect(authorized).to.have.length(1);
    expect(authorized[0].apiEndpoint).to.equal('https://tok-789@alice.test.local/');
    expect(authorized[0].key).to.equal(undefined);
    // the cookie holds a usable sign-in
    expect(loginBtn.getAuthorizationData().apiEndpoint).to.equal('https://tok-789@alice.test.local/');
    expect(global.window.location.href).to.equal('http://localhost/app');
    expect(handoff.cacheGet('flowkey4').token).to.equal('tok-789');
    // the auth page URL of the flow is known again after the redirect
    expect(loginBtn.auth._authUrl).to.contain('ui.test.local');

    await loginBtn.auth.signOut();
    expect(handoff.cacheGet('flowkey4')).to.equal(null);
    const stored = loginBtn.getAuthorizationData();
    expect(stored == null || stored.deleted === true).to.equal(true);
  });

  it('[LBH6] the button never stores a sign-in without a token', async () => {
    f.setPage('http://localhost/app');
    const loginBtn = new LoginButton({ authRequest: { requestingAppId: 'lbh6-app', requestedPermissions: [] } },
      fakeService({ access: 'https://reg.test.local/access/', name: 'Test' }));
    await loginBtn.init();
    await loginBtn.onStateChange({ status: 'ACCEPTED', username: 'bob', apiEndpoint: 'https://bob.test.local/' });
    expect(loginBtn.getAuthorizationData()).to.equal(undefined);
    await loginBtn.onStateChange({ status: 'ACCEPTED', username: 'bob', apiEndpoint: 'https://tok@bob.test.local/' });
    expect(loginBtn.getAuthorizationData().apiEndpoint).to.equal('https://tok@bob.test.local/');
    await loginBtn.deleteAuthorizationData();
  });

  it('[LBH5] a refused request returns to the sign-in button; an unknown key is an ERROR', async () => {
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey5');
    seedFlow('flowkey5', 'https://reg.test.local/access/flowkey5');
    f.poll({ status: 'REFUSED', reasonID: 'REFUSED_BY_USER' }, { status: 403 });
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(authController.state.status).to.equal('INITIALIZED');

    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey6');
    seedFlow('flowkey6', 'https://reg.test.local/access/flowkey6');
    f.poll({ error: { id: 'unknown-access-key' } }, { status: 400 });
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(authController.state.status).to.equal('ERROR');
    expect(authController.state.error).to.eql({ id: 'unknown-access-key' });
  });

  it('[LBH3] a failed redemption ends in ERROR, never a token-less AUTHORIZED', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey3');
    seedFlow('flowkey3', 'https://reg.test.local/access/flowkey3');
    f.poll(HANDOFF_BODY);
    f.retrieve(() => { throw new Error('shared-secret-unavailable'); });
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);

    expect(authController.state.status).to.equal('ERROR');
    expect(authController.state.message).to.equal('Credential hand-off failed');
    expect(authController.state.apiEndpoint).to.equal(undefined);
  });
});

/**
 * [LBRB] A sign-in return is honoured only for the auth request this page
 * started, and only the poll URL the server gave for that request is fetched.
 * A link carrying another key or a foreign poll URL must not sign the page in
 * (to an attacker's host, or into someone else's account). Observed: the URLs
 * fetched (a test reading only the final state would pass against a fetch
 * that happened), the retrieve calls, the state, the cookie and the stored flow.
 */
describe('[LBRB] LoginButton redirect return is bound to the flow this page started', function () {
  const f = redirectReturnFixture();
  const ACCEPTED = { status: 'ACCEPTED', username: 'alice', apiEndpoint: 'https://tok@alice.mc.example.com/' };
  const CORE_POLL = 'https://core-a.mc.example.com/reg/access/k1';
  const SERVICE_INFO = { access: 'https://access.mc.example.com/access/', api: 'https://{username}.mc.example.com/' };

  function expectRefused (authController) {
    expect(f.fetchCalls).to.have.length(0);
    expect(f.retrieveCalls).to.have.length(0);
    expect(authController.state.status).to.equal('ERROR');
    expect(authController.state.error.id).to.equal('unexpected-auth-return');
    expect(authController._authFlowKey).to.equal(undefined);
    expect(global.window.location.href).to.equal('http://localhost/app');
  }

  it('[LBRB1] a redirect sign-in stores the flow before navigating; a popup sign-in stores nothing', async () => {
    f.setPage('http://localhost/app');
    const service = fakeService(Object.assign({ name: 'Test' }, SERVICE_INFO));
    const redirectBtn = new LoginButton({ authRequest: { requestingAppId: 'lbrb1-app', requestedPermissions: [], returnURL: 'self#' } }, service);
    redirectBtn._cookieKey = 'pryv-libjs-lbrb1-app';
    const navigated = [];
    const savedLocation = Object.getOwnPropertyDescriptor(global, 'location');
    Object.defineProperty(global, 'location', { value: { get href () { return navigated[navigated.length - 1]; }, set href (v) { navigated.push(v); } }, configurable: true, writable: true });
    try {
      await redirectBtn.onStateChange({ status: 'NEED_SIGNIN', key: 'k1', poll: CORE_POLL, authUrl: 'https://ui.example.com/access?key=k1' });
    } finally {
      Object.defineProperty(global, 'location', savedLocation);
    }
    expect(navigated).to.deep.equal(['https://ui.example.com/access?key=k1']);
    expect(storedFlow('pryv-libjs-lbrb1-app')).to.deep.equal({ key: 'k1', poll: CORE_POLL, authUrl: 'https://ui.example.com/access?key=k1' });

    const popupBtn = new LoginButton({ authRequest: { requestingAppId: 'lbrb1p-app', requestedPermissions: [] } }, service);
    popupBtn._cookieKey = 'pryv-libjs-lbrb1p-app';
    const originalOpen = global.window.open;
    global.window.open = () => null;
    try {
      await popupBtn.onStateChange({ status: 'NEED_SIGNIN', key: 'k2', poll: CORE_POLL, authUrl: 'https://ui.example.com/access?key=k2' });
    } finally { global.window.open = originalOpen; }
    expect(storedFlow('pryv-libjs-lbrb1p-app')).to.equal(null);
  });

  it('[LBRB2] a return with no flow started on this page is refused without any fetch', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Fevil.example%2Fpoll&prYvkey=x&prYvstatus=ACCEPTED');
    f.poll(ACCEPTED);
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expectRefused(authController);
  });

  it('[LBRB3] a return for another key is refused and keeps the pending flow', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Faccess.mc.example.com%2Faccess%2Fk2&prYvkey=k2');
    seedFlow('k1', CORE_POLL);
    f.poll(ACCEPTED);
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expectRefused(authController);
    expect(storedFlow().key).to.equal('k1');
  });

  it('[LBRB4] the stored (core) poll URL is fetched, never the one in the URL nor access + key; the flow is consumed', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Fevil.example%2Faccess%2Fk1&prYvkey=k1');
    seedFlow('k1', CORE_POLL);
    f.poll(ACCEPTED);
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(f.fetchCalls).to.deep.equal([CORE_POLL]);
    expect(authController.state.status).to.equal('ACCEPTED');
    expect(storedFlow()).to.equal(null);
  });

  it('[LBRB5] a return carrying only the key polls the stored URL', async () => {
    f.setPage('http://localhost/app?pryvKey=k1');
    seedFlow('k1', CORE_POLL);
    f.poll(ACCEPTED);
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(f.fetchCalls).to.deep.equal([CORE_POLL]);
    expect(authController.state.status).to.equal('ACCEPTED');
  });

  it('[LBRB6] an apiEndpoint on a core host outside the api template is accepted (DNSless multi-core)', async () => {
    f.setPage('http://localhost/app?prYvkey=k1');
    seedFlow('k1', 'https://api2.example.com/reg/access/k1');
    f.poll({ status: 'ACCEPTED', username: 'alice', apiEndpoint: 'https://tok@api2.example.com/alice/' });
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(authController.state.status).to.equal('ACCEPTED');
    expect(authController.state.apiEndpoint).to.equal('https://tok@api2.example.com/alice/');
  });

  it('[LBRB7] a forged return through a real button stores nothing', async () => {
    f.setPage('http://localhost/app?prYvpoll=https%3A%2F%2Fevil.example%2Fpoll&prYvkey=x');
    f.poll(ACCEPTED);
    const external = [];
    const loginBtn = new LoginButton({
      onStateChange: (s) => external.push(s),
      authRequest: { requestingAppId: 'lbrb7-app', requestedPermissions: [], returnURL: 'self#' }
    }, fakeService(Object.assign({ name: 'Test' }, SERVICE_INFO)));
    await loginBtn.init();
    expect(f.fetchCalls).to.have.length(0);
    expect(loginBtn.auth.state.status).to.equal('ERROR');
    expect(external.map((s) => s.status)).to.not.include('ACCEPTED');
    expect(loginBtn.getAuthorizationData()).to.equal(undefined);
  });

  it('[LBRB9] a stored flow without a usable poll URL is refused without any fetch', async () => {
    f.setPage('http://localhost/app?prYvkey=k1');
    global.window.sessionStorage.setItem(COOKIE_KEY + '-authflow', JSON.stringify({ key: 'k1' }));
    f.poll(ACCEPTED);
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expectRefused(authController);
  });

  it('[LBRBA] an account switch by redirection ends on the new account, the previous one remembered', async () => {
    f.setPage('http://localhost/app?prYvkey=k1');
    const loginBtn = new LoginButton({ authRequest: { requestingAppId: 'lbrba-app', requestedPermissions: [], returnURL: 'self#' } },
      fakeService(Object.assign({ name: 'Test' }, SERVICE_INFO)));
    loginBtn._cookieKey = 'pryv-libjs-lbrba-app';
    loginBtn.saveAuthorizationData({ username: 'bob', apiEndpoint: 'https://tb@bob.mc.example.com/', profiles: [{ username: 'bob', apiEndpoint: 'https://tb@bob.mc.example.com/' }] });
    seedFlow('k1', CORE_POLL, 'pryv-libjs-lbrba-app');
    f.poll(ACCEPTED);
    await loginBtn.init();
    expect(f.fetchCalls).to.deep.equal([CORE_POLL]);
    expect(loginBtn.auth.state.username).to.equal('alice');
    const stored = loginBtn.getAuthorizationData();
    expect(stored.username).to.equal('alice');
    expect(stored.profiles.map((p) => p.username)).to.deep.equal(['alice', 'bob']);
    await loginBtn.deleteAuthorizationData();
  });

  it('[LBRBD] a switch return that is refused, fails or was never started keeps the account already signed in', async () => {
    const cases = [
      ['refused', 'http://localhost/app?prYvkey=k1', true, { status: 'REFUSED' }, { status: 403 }],
      ['unknown key', 'http://localhost/app?prYvkey=k1', true, { error: { id: 'unknown-access-key' } }, { status: 400 }],
      ['stray link', 'http://localhost/app?prYvkey=other', false, ACCEPTED, { status: 200 }]
    ];
    for (const [label, page, seeded, body, response] of cases) {
      f.setPage(page);
      f.fetchCalls.length = 0;
      const loginBtn = new LoginButton({ authRequest: { requestingAppId: 'lbrbd-app', requestedPermissions: [], returnURL: 'self#' } },
        fakeService(Object.assign({ name: 'Test' }, SERVICE_INFO)));
      loginBtn._cookieKey = 'pryv-libjs-lbrbd-app';
      loginBtn.saveAuthorizationData({ username: 'bob', apiEndpoint: 'https://tb@bob.mc.example.com/', profiles: [{ username: 'bob', apiEndpoint: 'https://tb@bob.mc.example.com/' }] });
      if (seeded) seedFlow('k1', CORE_POLL, 'pryv-libjs-lbrbd-app');
      f.poll(body, response);
      await loginBtn.init();
      expect(loginBtn.auth.state.status, label).to.equal('ACCEPTED');
      expect(loginBtn.auth.state.username, label).to.equal('bob');
      expect(loginBtn.getAuthorizationData().username, label).to.equal('bob');
      expect(f.fetchCalls.length, label).to.equal(seeded ? 1 : 0);
      await loginBtn.deleteAuthorizationData();
    }
  });

  it('[LBRBE] a redirect return remembers the poll URL for an app calling connectFromKey(key)', async () => {
    f.setPage('http://localhost/app?prYvkey=k-rem');
    seedFlow('k-rem', 'https://core-b.mc.example.com/reg/access/k-rem');
    f.poll(ACCEPTED);
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, { serviceInfo: SERVICE_INFO });
    expect(pollUrls.lookup('k-rem')).to.equal('https://core-b.mc.example.com/reg/access/k-rem');
  });

  it('[LBRBB] a click on the button in ERROR starts over instead of doing nothing', async () => {
    f.setPage('http://localhost/app?prYvkey=forged');
    const loginBtn = new LoginButton({ authRequest: { requestingAppId: 'lbrbb-app', requestedPermissions: [], returnURL: 'self#' } },
      fakeService(Object.assign({ name: 'Test' }, SERVICE_INFO)));
    await loginBtn.init();
    expect(loginBtn.auth.state.status).to.equal('ERROR');
    await loginBtn.auth.handleClick();
    expect(loginBtn.auth.state.status).to.equal('INITIALIZED');
  });

  it('[LBRBC] leftover one-shot params without a key are cleaned; a malformed escape does not break init', async () => {
    f.setPage('http://localhost/app?x=1&prYvstatus=ACCEPTED');
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, { serviceInfo: SERVICE_INFO });
    expect(global.window.location.href).to.equal('http://localhost/app?x=1');

    f.setPage('http://localhost/app?q=100%&prYvkey=k1');
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expect(authController.state.error.id).to.equal('unexpected-auth-return');
  });

  it('[LBRB8] without sessionStorage, a redirect sign-in still navigates and a return is refused', async () => {
    f.setPage('http://localhost/app?prYvkey=k1');
    Object.defineProperty(global.window, 'sessionStorage', { get () { throw new Error('blocked'); }, configurable: true });
    const btn = new LoginButton({ authRequest: { requestingAppId: 'lbrb8-app', requestedPermissions: [], returnURL: 'self#' } },
      fakeService(Object.assign({ name: 'Test' }, SERVICE_INFO)));
    btn._cookieKey = 'pryv-libjs-lbrb8-app';
    const navigated = [];
    const savedLocation = Object.getOwnPropertyDescriptor(global, 'location');
    Object.defineProperty(global, 'location', { value: { get href () { return navigated[navigated.length - 1]; }, set href (v) { navigated.push(v); } }, configurable: true, writable: true });
    try {
      await btn.onStateChange({ status: 'NEED_SIGNIN', key: 'k1', poll: CORE_POLL, authUrl: 'https://ui.example.com/access?key=k1' });
    } finally {
      Object.defineProperty(global, 'location', savedLocation);
    }
    expect(navigated).to.have.length(1);

    f.poll(ACCEPTED);
    const authController = { serviceInfo: SERVICE_INFO };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call(THIS, authController);
    expectRefused(authController);
  });
});
