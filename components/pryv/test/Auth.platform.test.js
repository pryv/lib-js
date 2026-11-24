/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, beforeEach, after, afterEach, expect, JSDOM */

const AuthController = require('../src/Auth/AuthController');
const AuthStates = require('../src/Auth/AuthStates');
const LoginButton = require('../src/Browser/LoginButton');
const utils = require('../src/utils');

// A stored sign-in is used only with the platform it was made on: the service
// information URL the app gave. Node only (JSDOM): each test sets the page URL.
const P = 'https://platform.example/service/info';
const EVIL = 'https://evil.example/info';
const ALICE = { username: 'alice', apiEndpoint: 'https://tok-a@alice.platform.example/' };
const BOB = { username: 'bob', apiEndpoint: 'https://tok-b@bob.platform.example/' };
const APP = 'platform-app';
const KEY = 'pryv-libjs-' + APP;

/** A service as the app created it for `url`; its information can claim anything. */
function service (url) {
  return {
    _serviceInfoUrl: url,
    infoSync: () => ({ name: 'S', access: 'https://access.platform.example/', api: 'https://{username}.platform.example/', account: 'https://account.platform.example' }),
    info: async () => {},
    assets: async () => ({ loginButtonLoadCSS: async () => {}, loginButtonGetMessages: async () => ({ LOADING: 'Loading...' }) })
  };
}

/** A custom button keeping its data in memory. */
function customButton (stored) {
  const button = {
    stored,
    saves: 0,
    deletes: 0,
    onStateChange: async () => {},
    onClick () {},
    getAuthorizationData: () => button.stored,
    saveAuthorizationData (data) { button.saves++; button.stored = data; },
    async deleteAuthorizationData () { button.deletes++; button.stored = null; }
  };
  return button;
}

function settings (extra) {
  return Object.assign({ authRequest: { requestingAppId: APP, requestedPermissions: [] } }, extra);
}

describe('[APLX] a stored sign-in is bound to its platform', function () {
  const GLOBALS = ['document', 'window', 'location', 'navigator'];
  let saved, originalFetchGet;
  const fetched = [];

  function setPage (url) {
    const cookies = global.document?.cookie ?? '';
    const dom = new JSDOM('<!DOCTYPE html><body></body>', { url });
    for (const cookie of cookies.split('; ').filter(Boolean)) dom.window.document.cookie = cookie + '; path=/';
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
  }

  before(function () {
    if (typeof JSDOM === 'undefined') this.skip();
    saved = {};
    for (const name of GLOBALS) saved[name] = Object.getOwnPropertyDescriptor(global, name);
    Object.defineProperty(global, 'navigator', { value: { userAgent: 'Safari' }, configurable: true, writable: true });
    originalFetchGet = utils.fetchGet;
  });

  beforeEach(() => {
    global.document = undefined;
    setPage('http://localhost/app');
    fetched.length = 0;
    utils.fetchGet = async (url) => { fetched.push(url); return { response: { status: 200 }, body: { status: 'ACCEPTED', ...BOB } }; };
  });

  afterEach(() => { utils.fetchGet = originalFetchGet; });

  after(() => {
    if (saved == null) return;
    for (const name of GLOBALS) {
      if (saved[name]) Object.defineProperty(global, name, saved[name]);
      else delete global[name];
    }
  });

  async function controller (url, button, extra) {
    const auth = new AuthController(settings(extra), service(url), button);
    auth.accessInfoCalls = 0;
    auth._accessInfo = async () => { auth.accessInfoCalls++; return {}; };
    await auth.init();
    return auth;
  }

  async function loginButton (url, extra) {
    const btn = new LoginButton(settings(extra), service(url));
    await btn.init();
    return btn;
  }

  it('[APL1] the platform of a controller is the URL the app gave, whatever the information claims', function () {
    expect(new AuthController(settings(), service(P), null).platform).to.equal(P);
    expect(new AuthController(settings(), service(EVIL), null).platform).to.equal(EVIL);
    expect(new AuthController(settings(), service(null), null).platform).to.equal('inline:https://access.platform.example/');
  });

  it('[APL2] the sign-in of another platform is not used: not signed in, not checked, not listed, its auth page not taken', async function () {
    const button = customButton(Object.assign({ platform: P, authUrl: 'https://genuine.example/auth', profiles: [ALICE, BOB] }, ALICE));
    const auth = await controller(EVIL, button, { authRequest: { requestingAppId: APP, requestedPermissions: [{ streamId: 's', level: 'read' }] } });
    expect(auth.state.status).to.equal(AuthStates.INITIALIZED);
    expect(auth.accessInfoCalls).to.equal(0);
    expect(auth.profiles()).to.deep.equal([]);
    expect(auth._authUrl).to.equal(undefined);
    expect([button.saves, button.deletes]).to.deep.equal([0, 0]);

    const own = await controller(P, button, {});
    expect(own.state.status).to.equal(AuthStates.AUTHORIZED);
    expect(own.state.username).to.equal('alice');
    // a single account, as a custom button stores it: the listeners get the shape they know
    const single = await controller(P, customButton(Object.assign({ platform: P }, ALICE)));
    expect(single.state.username).to.equal('alice');
    expect(single.state).to.not.have.property('platform');
  });

  it('[APL3] another platform cannot change nor forget it: sign-out, sign-out of all', async function () {
    for (const options of [undefined, { all: true }]) {
      const stored = Object.assign({ platform: P, profiles: [ALICE, BOB] }, ALICE);
      const before = JSON.stringify(stored);
      const button = customButton(stored);
      const auth = await controller(EVIL, button);
      await auth.signOut(options);
      expect(auth.state.status).to.equal(AuthStates.INITIALIZED);
      expect([button.saves, button.deletes]).to.deep.equal([0, 0]);
      expect(JSON.stringify(button.stored)).to.equal(before);
      auth._saveProfiles(auth._readProfiles());
      expect([button.saves, button.deletes]).to.deep.equal([0, 0], 'an empty list of its own forgets nothing');
    }
    // its own platform forgets it, and keeps the others stamped
    const button = customButton(Object.assign({ platform: P, profiles: [ALICE, BOB] }, ALICE));
    const auth = await controller(P, button);
    await auth.signOut();
    expect(button.stored.platform).to.equal(P);
    expect(button.stored.profiles.map((p) => p.username)).to.deep.equal(['bob']);
    await auth.signOut({ all: true });
    expect(button.stored).to.equal(null);
  });

  it('[APL4] a sign-in stored by an earlier version is kept, unless the page address names the platform', async function () {
    const own = encodeURIComponent(P);
    const pages = [
      ['http://localhost/app', true],
      ['http://localhost/app?pryvServiceInfoUrl=' + encodeURIComponent(EVIL), true],
      ['http://localhost/app?pryvServiceInfoUrl=' + own, false],
      ['http://localhost/app#pryvServiceInfoUrl=' + own, false],
      ['http://localhost/app?a=1&pryvServiceInfoUrl=' + own + '&b=2', false],
      ['http://localhost/app?pryvServiceInfoUrl=' + own + '&pryvServiceInfoUrl=' + encodeURIComponent(EVIL), false],
      ['http://localhost/app?pryvServiceInfoUrl=' + encodeURIComponent(EVIL) + '&pryvServiceInfoUrl=' + own, false],
      ['http://localhost/app?pryvServiceInfoUrl=' + encodeURIComponent(P + '#x'), false]
    ];
    for (const [page, kept] of pages) {
      setPage(page);
      const button = customButton(Object.assign({}, ALICE));
      const auth = await controller(P, button);
      expect(auth.state.status, page).to.equal(kept ? AuthStates.AUTHORIZED : AuthStates.INITIALIZED);
      expect([button.saves, button.deletes], page).to.deep.equal([0, 0]);
      expect(button.stored, page).to.deep.equal(ALICE);
    }
  });

  it('[APL5] the default button: cookies name their platform, another platform leaves them byte-identical, then stores its own only', async function () {
    const mine = await loginButton(P);
    await mine.onStateChange({ status: 'ACCEPTED', ...ALICE });
    await mine.onStateChange({ status: 'ACCEPTED', ...BOB });
    const stored = mine.getAuthorizationData();
    expect(stored.platform).to.equal(P);
    expect(stored.profiles.map((p) => p.username)).to.deep.equal(['bob', 'alice']);
    const cookies = global.document.cookie;
    expect(cookies.split(encodeURIComponent(encodeURIComponent(P))).length + cookies.split(encodeURIComponent(P)).length).to.be.greaterThan(3, 'in both cookies');

    const foreign = await loginButton(EVIL);
    expect(foreign.auth.state.status).to.equal(AuthStates.INITIALIZED);
    expect(foreign.auth.profiles()).to.deep.equal([]);
    await foreign.auth.signOut({ all: true });
    expect(global.document.cookie).to.equal(cookies);

    const again = await loginButton(P);
    expect(again.auth.state.username).to.equal('bob');

    await foreign.onStateChange({ status: 'ACCEPTED', username: 'mallory', apiEndpoint: 'https://t@mallory.platform.example/' });
    const planted = foreign.getAuthorizationData();
    expect(planted.platform).to.equal(EVIL);
    expect(planted.profiles.map((p) => p.username)).to.deep.equal(['mallory']);
    const genuine = await loginButton(P);
    expect(genuine.auth.state.status).to.equal(AuthStates.INITIALIZED, 'an account signed in under another platform is never used under this one');
    await foreign.deleteAuthorizationData();
  });

  it('[APL6] the default button stamps the sign-in of an earlier version when it keeps it', async function () {
    const btn = new LoginButton(settings(), service(P));
    btn._cookieKey = KEY;
    btn.saveAuthorizationData(Object.assign({ profiles: [ALICE, BOB] }, ALICE));
    expect(btn.getAuthorizationData().platform).to.equal(undefined);
    await btn.init();
    expect(btn.auth.state.username).to.equal('alice');
    expect(btn.getAuthorizationData().platform).to.equal(P);
    expect(btn.getAuthorizationData().profiles).to.have.lengthOf(2);
    await btn.deleteAuthorizationData();
  });

  it('[APL7] the two cookies are read together only when they name the same platform', async function () {
    const btn = new LoginButton(settings(), service(P));
    btn._cookieKey = KEY;
    btn.saveAuthorizationData(Object.assign({ platform: P, profiles: [BOB, ALICE] }, BOB));
    // an earlier version rewrote the main cookie only
    const Cookies = require('../src/Browser/CookieUtils');
    Cookies.set(KEY, ALICE, undefined, btn._cookieOptions);
    expect(btn.getAuthorizationData()).to.deep.equal(ALICE);
    // nobody active: the list says which platform it is
    btn.saveAuthorizationData({ platform: P, authUrl: 'https://u.example/auth', profiles: [BOB] });
    expect(btn.getAuthorizationData()).to.deep.equal({ platform: P, authUrl: 'https://u.example/auth', profiles: [BOB] });
    await btn.deleteAuthorizationData();
  });

  it('[APL8] a sign-in by redirection started under another platform is refused: nothing fetched, nothing stored', async function () {
    const flow = (platform) => JSON.stringify(Object.assign({ key: 'k1', poll: 'https://evil.example/poll/k1', authUrl: 'https://evil.example/auth' }, platform ? { platform } : {}));
    for (const started of [EVIL, null]) {
      setPage('http://localhost/app?pryvServiceInfoUrl=' + encodeURIComponent(P) + '&pryvKey=k1');
      global.window.sessionStorage.setItem(KEY + '-authflow', flow(started));
      const btn = new LoginButton(settings({ authRequest: { requestingAppId: APP, requestedPermissions: [], returnURL: 'self#' } }), service(P));
      btn._cookieKey = KEY;
      btn.auth = { platform: P };
      expect(btn.hasAuthReturn(), String(started)).to.equal(false);
      await btn.init();
      expect(fetched, String(started)).to.deep.equal([]);
      expect(btn.auth.state.status, String(started)).to.equal(AuthStates.ERROR);
      expect(btn.auth.state.error.id).to.equal('unexpected-auth-return');
      expect(btn.getAuthorizationData()).to.equal(undefined);
    }
    // the same return, started here
    setPage('http://localhost/app?pryvServiceInfoUrl=' + encodeURIComponent(P) + '&pryvKey=k1');
    global.window.sessionStorage.setItem(KEY + '-authflow', flow(P));
    const btn = new LoginButton(settings({ authRequest: { requestingAppId: APP, requestedPermissions: [], returnURL: 'self#' } }), service(P));
    btn._cookieKey = KEY;
    btn.auth = { platform: P };
    expect(btn.hasAuthReturn()).to.equal(true);
    await btn.init();
    expect(fetched).to.deep.equal(['https://evil.example/poll/k1']);
    expect(btn.auth.state.username).to.equal('bob');
    expect(btn.getAuthorizationData().platform).to.equal(P);
    await btn.deleteAuthorizationData();
  });

  it('[APL9] a redirect sign-in keeps the platform it was started under', async function () {
    const btn = await loginButton(P, { authRequest: { requestingAppId: APP, requestedPermissions: [], returnURL: 'self#' } });
    await btn.onStateChange({ status: 'NEED_SIGNIN', key: 'k2', poll: 'https://p.example/k2', authUrl: 'http://localhost/app#auth' });
    expect(JSON.parse(global.window.sessionStorage.getItem(KEY + '-authflow')).platform).to.equal(P);
  });

  it('[APLA] a custom button that stores `auth.platform` is signed in again on that platform only', async function () {
    const button = customButton(null);
    const auth = await controller(P, button);
    button.saveAuthorizationData(Object.assign({ platform: auth.platform }, ALICE));
    expect((await controller(P, button)).state.status).to.equal(AuthStates.AUTHORIZED);
    expect((await controller(EVIL, button)).state.status).to.equal(AuthStates.INITIALIZED);
    // a storage that answers later
    const slow = customButton(null);
    slow.getAuthorizationData = async () => Object.assign({ platform: P }, ALICE);
    expect((await controller(P, slow)).state.status).to.equal(AuthStates.AUTHORIZED);
    expect((await controller(EVIL, slow)).state.status).to.equal(AuthStates.INITIALIZED);
    // its sign-out still forgets it
    setPage('http://localhost/app?pryvServiceInfoUrl=' + encodeURIComponent(P));
    const signedIn = await controller(P, slow);
    await signedIn.signOut({ all: true });
    expect(slow.deletes).to.equal(1);
  });
});
