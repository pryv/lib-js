/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, afterEach, expect, JSDOM, testData */

const LoginButton = require('../src/Browser/LoginButton');
const Service = require('../src/Service');
const AuthStates = require('../src/Auth/AuthStates');

describe('[LBTX] LoginButton', function () {
  this.timeout(20000);

  let service;
  let cleanupDom = false;
  let dom;

  before(async function () {
    await testData.prepare();
    service = new Service(testData.serviceInfoUrl);
    await service.info();
  });

  before(async () => {
    if (typeof document !== 'undefined') return;
    cleanupDom = true;
    dom = new JSDOM('<!DOCTYPE html><body><span id="loginButton"></span></body>', {
      url: 'http://localhost/'
    });
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
    global.navigator = { userAgent: 'Safari' };
    global.confirm = () => true;
  });

  after(async () => {
    if (!cleanupDom) return;
    delete global.document;
    delete global.window;
    delete global.location;
    delete global.navigator;
    delete global.confirm;
  });

  describe('[LBCX] Constructor and Init', function () {
    it('[LBCA] creates LoginButton with valid settings', async function () {
      const settings = {
        spanButtonID: 'loginButton',
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      };
      const loginBtn = new LoginButton(settings, service);
      expect(loginBtn.authSettings).to.equal(settings);
      expect(loginBtn.service).to.equal(service);
    });

    it('[LBCB] init() sets up button and auth controller', async function () {
      const settings = {
        spanButtonID: 'loginButton',
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      };
      const loginBtn = new LoginButton(settings, service);
      await loginBtn.init();
      expect(loginBtn.auth).to.exist;
      expect(loginBtn._cookieKey).to.include('pryv-libjs-');
    });
  });

  describe('[LBAX] Authorization data', function () {
    let loginBtn;

    before(async function () {
      const settings = {
        spanButtonID: 'loginButton',
        authRequest: {
          requestingAppId: 'test-app-auth',
          requestedPermissions: []
        }
      };
      loginBtn = new LoginButton(settings, service);
      await loginBtn.init();
    });

    it('[LBAA] saveAuthorizationData and getAuthorizationData work', function () {
      const authData = { apiEndpoint: 'https://test.pryv.me', username: 'testuser' };
      loginBtn.saveAuthorizationData(authData);
      const retrieved = loginBtn.getAuthorizationData();
      expect(retrieved).to.deep.equal(authData);
    });

    it('[LBAB] deleteAuthorizationData removes data', async function () {
      loginBtn.saveAuthorizationData({ test: 'data' });
      await loginBtn.deleteAuthorizationData();
      const retrieved = loginBtn.getAuthorizationData();
      // After deletion, either undefined or has deleted flag
      if (retrieved) {
        expect(retrieved.deleted).to.be.true;
      }
    });
  });

  describe('[LBOX] onClick', function () {
    it('[LBOA] onClick calls auth.handleClick', async function () {
      const settings = {
        spanButtonID: 'loginButton',
        authRequest: {
          requestingAppId: 'test-app-click',
          requestedPermissions: []
        }
      };
      const loginBtn = new LoginButton(settings, service);
      await loginBtn.init();

      let handleClickCalled = false;
      loginBtn.auth.handleClick = function () { handleClickCalled = true; };

      loginBtn.onClick();
      expect(handleClickCalled).to.be.true;
    });
  });

  describe('[LBSX] onStateChange', function () {
    let loginBtn;

    before(async function () {
      const settings = {
        spanButtonID: 'loginButton',
        authRequest: {
          requestingAppId: 'test-app-state',
          requestedPermissions: []
        }
      };
      loginBtn = new LoginButton(settings, service);
      await loginBtn.init();
    });

    it('[LBSA] handles LOADING state', async function () {
      await loginBtn.onStateChange({ status: AuthStates.LOADING });
      expect(loginBtn.text).to.equal('...');
    });

    it('[LBSB] handles INITIALIZED state', async function () {
      await loginBtn.onStateChange({ status: AuthStates.INITIALIZED });
      expect(loginBtn.text).to.include('Signin');
    });

    it('[LBSC] handles AUTHORIZED state', async function () {
      await loginBtn.onStateChange({
        status: AuthStates.AUTHORIZED,
        username: 'testuser',
        apiEndpoint: 'https://test.pryv.me'
      });
      expect(loginBtn.text).to.equal('testuser');
    });

    it('[LBSD] handles ERROR state', async function () {
      await loginBtn.onStateChange({
        status: AuthStates.ERROR,
        message: 'Test error'
      });
      expect(loginBtn.text).to.include('Error');
      expect(loginBtn.text).to.include('Test error');
    });

    it('[LBSE] handles SIGNOUT state by asking in a built-in dialog', async function () {
      loginBtn.saveAuthorizationData({ test: 'data' });
      await loginBtn.onStateChange({ status: AuthStates.SIGNOUT });
      expect(document.querySelector('.pryv-menu .pryv-menu-logout')).to.exist;
      expect(document.querySelector('.pryv-menu').getAttribute('role')).to.equal('alertdialog');
      loginBtn.closeMenu(true); // no re-initialization running into the next test
    });

    it('[LBSG] the re-init after the logout question is awaitable, never left running untracked', async function () {
      // A re-init that nobody waits for resumes later and consumes whatever
      // poll URL the page shows by then (it raced [LBRU] on CI). SIGNOUT itself
      // starts none now: it asks first; "Log out" and a dismissal each start
      // one and expose it (`pending`, and closeMenu's promise).
      const originalInit = loginBtn.auth.init;
      let reinits = 0;
      loginBtn.auth.init = async function () {
        await new Promise((resolve) => setTimeout(resolve, 50));
        reinits++;
      };
      try {
        await loginBtn.onStateChange({ status: AuthStates.SIGNOUT });
        expect(reinits).to.equal(0);
        document.querySelector('.pryv-menu .pryv-menu-logout').click();
        await loginBtn.pending;
        expect(reinits).to.equal(1);

        await loginBtn.onStateChange({ status: AuthStates.SIGNOUT });
        await loginBtn.closeMenu(); // dismissed
        expect(reinits).to.equal(2);
      } finally {
        loginBtn.auth.init = originalInit;
      }
    });

    it('[LBSF] handles unknown state gracefully', async function () {
      // Should log warning but not throw
      await loginBtn.onStateChange({ status: 'UNKNOWN_STATE' });
    });
  });

  describe('[LBMX] account menu', function () {
    let confirms;
    let originalConfirm;

    before(() => {
      originalConfirm = global.confirm;
      global.confirm = () => { confirms++; return true; };
    });
    after(() => { global.confirm = originalConfirm; });

    async function signedInButton (extra) {
      confirms = 0;
      const states = [];
      const settings = Object.assign({
        spanButtonID: 'loginButton',
        authRequest: { requestingAppId: 'test-app-menu', requestedPermissions: [] },
        onStateChange: (s) => states.push(s.status),
        accountUrl: 'https://account.example.com'
      }, extra);
      const loginBtn = new LoginButton(settings, service);
      await loginBtn.init();
      loginBtn.auth.state = { status: AuthStates.AUTHORIZED, username: 'menu-user', apiEndpoint: 'https://tok@menu-user.example.com/' };
      states.length = 0;
      return { loginBtn, states };
    }
    const dialog = () => document.querySelector('.pryv-menu');
    const key = (k, opts) => document.dispatchEvent(new window.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true }, opts)));

    afterEach(() => {
      document.querySelectorAll('.pryv-menu-overlay').forEach((n) => n.parentNode.removeChild(n));
    });

    it('[LBMA] a click on the signed-in button opens the menu and emits no state', async function () {
      const { loginBtn, states } = await signedInButton();
      loginBtn.onClick();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(states).to.deep.equal([]);
      expect(confirms).to.equal(0);
      expect(dialog()).to.exist;
      expect(dialog().getAttribute('role')).to.equal('dialog');
      expect(dialog().getAttribute('aria-modal')).to.equal('true');
      expect(dialog().querySelector('.pryv-menu-username').textContent).to.equal('menu-user');
      expect(dialog().querySelector('.pryv-menu-info').textContent).to.include('test-app-menu');
      expect(dialog().querySelector('.pryv-menu-logout')).to.exist;
      expect(dialog().querySelector('.pryv-menu-account')).to.exist;
      // the built-in style comes first, so a service stylesheet overrides it
      expect(document.head.firstChild.id).to.equal('pryv-menu-style');
      expect(dialog().getAttribute('aria-labelledby')).to.equal('pryv-menu-username');
    });

    it('[LBMH] the stored credentials keep the auth page URL of the sign-in', async function () {
      const { loginBtn } = await signedInButton();
      await loginBtn.onStateChange({ status: AuthStates.AUTHORIZED, username: 'menu-user', apiEndpoint: 'https://tok@menu-user.example.com/', authUrl: 'https://ui.example.com/auth' });
      expect(loginBtn.getAuthorizationData().authUrl).to.equal('https://ui.example.com/auth');
      // the ACCEPTED poll body carries no authUrl: the one remembered from the request is used
      loginBtn.auth._authUrl = 'https://ui2.example.com/auth';
      await loginBtn.onStateChange({ status: AuthStates.AUTHORIZED, username: 'menu-user', apiEndpoint: 'https://tok@menu-user.example.com/' });
      expect(loginBtn.getAuthorizationData().authUrl).to.equal('https://ui2.example.com/auth');
    });

    it('[LBMB] "Log out" emits SIGNOUT exactly once, without a confirmation, and clears the credentials', async function () {
      const { loginBtn, states } = await signedInButton();
      loginBtn.saveAuthorizationData({ apiEndpoint: 'https://tok@menu-user.example.com/', username: 'menu-user' });
      loginBtn.showMenu();
      dialog().querySelector('.pryv-menu-logout').click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(states.filter((s) => s === AuthStates.SIGNOUT)).to.have.lengthOf(1);
      expect(confirms).to.equal(0);
      expect(dialog()).to.equal(null);
      expect(loginBtn.auth.state.status).to.equal(AuthStates.INITIALIZED);
      const stored = loginBtn.getAuthorizationData();
      expect(stored == null || stored.deleted === true).to.equal(true);
    });

    it('[LBMC] closes on its close button, on Escape and on a click outside, without logging out', async function () {
      const { loginBtn, states } = await signedInButton();
      loginBtn.showMenu();
      dialog().querySelector('.pryv-menu-close').click();
      expect(dialog()).to.equal(null);
      loginBtn.showMenu();
      key('Escape');
      expect(dialog()).to.equal(null);
      loginBtn.showMenu();
      const overlay = document.querySelector('.pryv-menu-overlay');
      overlay.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
      overlay.click();
      expect(dialog()).to.equal(null);
      // a text selection that started inside the dialog and ended outside it
      loginBtn.showMenu();
      dialog().dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
      document.querySelector('.pryv-menu-overlay').click();
      expect(dialog()).to.exist;
      loginBtn.closeMenu();
      loginBtn.showMenu();
      dialog().click(); // inside: stays open
      expect(dialog()).to.exist;
      expect(states).to.deep.equal([]);
    });

    it('[LBMD] keeps focus inside the menu', async function () {
      const { loginBtn } = await signedInButton();
      loginBtn.showMenu();
      const buttons = Array.from(dialog().querySelectorAll('button'));
      expect(document.activeElement).to.equal(buttons[0]);
      buttons[buttons.length - 1].focus();
      key('Tab');
      expect(document.activeElement).to.equal(buttons[0]);
      key('Tab', { shiftKey: true });
      expect(document.activeElement).to.equal(buttons[buttons.length - 1]);
    });

    it('[LBME] "Manage my account" opens the account app and closes the menu; hidden when unknown', async function () {
      const { loginBtn } = await signedInButton();
      const opened = [];
      const original = window.open;
      window.open = (...args) => { opened.push(args); return null; };
      try {
        loginBtn.showMenu();
        dialog().querySelector('.pryv-menu-account').click();
      } finally { window.open = original; }
      expect(opened).to.have.lengthOf(1);
      expect(opened[0][0]).to.match(/^https:\/\/account\.example\.com\/account\/profile\?pryvServiceInfoUrl=/);
      expect(dialog()).to.equal(null);

      const { loginBtn: unknown } = await signedInButton({ accountUrl: undefined });
      unknown.auth.serviceInfo = Object.assign({}, unknown.auth.serviceInfo, { account: undefined });
      unknown.showMenu();
      expect(dialog().querySelector('.pryv-menu-account')).to.equal(null);
    });

    it('[LBMF] entries can be hidden', async function () {
      for (const menu of [{ hide: ['account', 'info'] }, { account: false, info: false }]) {
        const { loginBtn } = await signedInButton({ menu });
        loginBtn.showMenu();
        expect(dialog().querySelector('.pryv-menu-account')).to.equal(null);
        expect(dialog().querySelector('.pryv-menu-info')).to.equal(null);
        expect(dialog().querySelector('.pryv-menu-logout')).to.exist;
        loginBtn.closeMenu();
      }
    });

    it('[LBMG] menu: false keeps the legacy flow (SIGNOUT on click) with a built-in "Log out?" dialog, never confirm()', async function () {
      const { loginBtn, states } = await signedInButton({ menu: false });
      expect(loginBtn.showMenu()).to.equal(false);
      loginBtn.saveAuthorizationData({ apiEndpoint: 'https://tok@menu-user.example.com/', username: 'menu-user' });
      loginBtn.onClick();
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(states.filter((s) => s === AuthStates.SIGNOUT)).to.have.lengthOf(1);
      expect(confirms).to.equal(0);
      expect(dialog().querySelector('.pryv-menu-username').textContent).to.equal('Logout?');
      expect(dialog().querySelector('.pryv-menu-account')).to.equal(null);
      // Cancel keeps the credentials and returns to the signed-in state
      // (the button used to stay inert after a cancelled logout)
      states.length = 0;
      dialog().querySelector('.pryv-menu-cancel').click();
      expect(dialog()).to.equal(null);
      await loginBtn.pending;
      expect(loginBtn.getAuthorizationData().username).to.equal('menu-user');
      expect(loginBtn.auth.state.status).to.equal(AuthStates.AUTHORIZED);
      // the documented contract: re-initialized from the stored credentials
      expect(states).to.deep.equal([AuthStates.LOADING, AuthStates.AUTHORIZED]);
      // the service's button stylesheet is added once (a browser page carries others)
      expect(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((l) => /buttonSignIn/.test(l.href)).length).to.be.at.most(1);
      // Log out clears them and re-initializes
      loginBtn.onClick();
      await new Promise((resolve) => setTimeout(resolve, 50));
      dialog().querySelector('.pryv-menu-logout').click();
      await loginBtn.pending;
      expect(confirms).to.equal(0);
      expect(loginBtn.auth.state.status).to.equal(AuthStates.INITIALIZED);
      const stored = loginBtn.getAuthorizationData();
      expect(stored == null || stored.deleted === true).to.equal(true);
    });
  });

  describe('[LBPX] several accounts and account switching', function () {
    const utils = require('../src/utils');
    const PARENT = 'parent-doe';
    const KIM = 'kim-doe';
    const hint = { isDelegatedAccess: true, controlledUsername: KIM, delegate: { username: PARENT } };
    const dialog = () => document.querySelector('.pryv-menu');
    let originals;

    before(() => {
      originals = { fetchPost: utils.fetchPost, fetchGet: utils.fetchGet, open: window.open };
      window.open = () => ({ focus () {} });
    });
    afterEach(() => {
      utils.fetchPost = originals.fetchPost;
      utils.fetchGet = originals.fetchGet;
      document.querySelectorAll('.pryv-menu-overlay').forEach((n) => n.parentNode.removeChild(n));
    });
    after(() => { window.open = originals.open; });

    async function button (extra, stored) {
      const states = [];
      const settings = Object.assign({
        spanButtonID: 'loginButton',
        authRequest: { requestingAppId: 'test-app-profiles', requestedPermissions: [] },
        onStateChange: (s) => states.push(s),
        accountUrl: 'https://account.example.com'
      }, extra);
      const loginBtn = new LoginButton(settings, service);
      loginBtn._cookieKey = 'pryv-libjs-test-app-profiles';
      await loginBtn.deleteAuthorizationData();
      if (stored != null) loginBtn.saveAuthorizationData(stored);
      await loginBtn.init();
      states.length = 0;
      return { loginBtn, states };
    }

    /** Answer the next auth request with NEED_SIGNIN, then `final` on the first poll. */
    function stubAuthRequest (final) {
      const posted = [];
      utils.fetchPost = async (url, body) => {
        posted.push(body);
        return { response: { ok: true }, body: { status: 'NEED_SIGNIN', key: 'k1', poll: 'https://reg.example.com/access/k1', poll_rate_ms: 10, authUrl: 'https://ui.example.com/auth?key=k1' } };
      };
      utils.fetchGet = async () => final;
      return posted;
    }

    async function settle () {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    it('[LBPA] a grant for a controlled account is labelled "via" its delegate and remembered next to the own account', async function () {
      const { loginBtn } = await button(null, { username: PARENT, apiEndpoint: 'https://tok1@parent.example.com/' });
      expect(loginBtn.auth.currentProfile()).to.deep.equal({ username: PARENT });
      stubAuthRequest({ response: { status: 200 }, body: { status: 'ACCEPTED', username: KIM, apiEndpoint: 'https://tok2@kim.example.com/', delegation: hint } });
      await loginBtn.auth.addAccount();
      await settle();
      expect(loginBtn.text).to.equal(KIM + ' (via ' + PARENT + ')');
      expect(loginBtn.auth.currentProfile()).to.deep.equal({ username: KIM, actingAs: { username: KIM, delegate: PARENT } });
      expect(loginBtn.auth.profiles()).to.deep.equal([
        { username: KIM, active: true, available: true, actingAs: { username: KIM, delegate: PARENT } },
        { username: PARENT, active: false, available: true }
      ]);
      const stored = loginBtn.getAuthorizationData();
      // the active account stays readable at the top level; the auth page is kept without its query
      expect(stored.username).to.equal(KIM);
      expect(stored.authUrl).to.equal('https://ui.example.com/auth');
      // after a reload the same account is signed in, still labelled "via"
      const { loginBtn: reloaded } = await button(null, stored);
      expect(reloaded.auth.currentProfile().actingAs.delegate).to.equal(PARENT);
      expect(reloaded.text).to.equal(KIM + ' (via ' + PARENT + ')');
    });

    it('[LBPB] "another account" sends actAs: allow; a switch to a named account sends that name; SWITCHING comes first', async function () {
      const { loginBtn, states } = await button(null, { username: PARENT, apiEndpoint: 'https://tok1@parent.example.com/' });
      let posted = stubAuthRequest({ response: { status: 200 }, body: { status: 'ACCEPTED', username: KIM, apiEndpoint: 'https://tok2@kim.example.com/', delegation: hint } });
      await loginBtn.auth.addAccount();
      await settle();
      expect(posted[0].actAs).to.equal('allow');
      expect(posted[0].requestingAppId).to.equal('test-app-profiles');
      expect(states.map((s) => s.status)).to.deep.equal([AuthStates.SWITCHING, AuthStates.NEED_SIGNIN, AuthStates.AUTHORIZED]);
      expect(states[0]).to.include({ from: PARENT, to: null });
      // the app's own setting is not changed by a switch
      expect(loginBtn.authSettings.authRequest.actAs).to.equal(undefined);
      posted = stubAuthRequest({ response: { status: 200 }, body: { status: 'ACCEPTED', username: 'lou-doe', apiEndpoint: 'https://tok3@lou.example.com/' } });
      await loginBtn.auth.switchTo('lou-doe');
      await settle();
      expect(posted[0].actAs).to.equal('lou-doe');
      expect(loginBtn.auth.currentProfile().username).to.equal('lou-doe');
    });

    it('[LBPC] switching to a remembered account whose access is valid needs no sign-in', async function () {
      const { loginBtn, states } = await button(null, {
        username: KIM,
        apiEndpoint: 'https://tok2@kim.example.com/',
        actingAs: { username: KIM, delegate: PARENT },
        profiles: [{ username: testData.username, apiEndpoint: testData.apiEndpointWithToken }]
      });
      utils.fetchPost = async () => { throw new Error('no auth request expected'); };
      await loginBtn.auth.switchTo(testData.username);
      expect(states.map((s) => s.status)).to.deep.equal([AuthStates.SWITCHING, AuthStates.AUTHORIZED]);
      expect(states[0]).to.include({ from: KIM, to: testData.username });
      expect(loginBtn.auth.currentProfile()).to.deep.equal({ username: testData.username });
      expect(loginBtn.getAuthorizationData().username).to.equal(testData.username);
    });

    it('[LBPD] "switch back" re-activates the delegate\'s own account', async function () {
      const { loginBtn } = await button(null, {
        username: KIM,
        apiEndpoint: 'https://tok2@kim.example.com/',
        actingAs: { username: KIM, delegate: testData.username },
        profiles: [{ username: 'someone-else', apiEndpoint: 'https://t@else.example.com/' }, { username: testData.username, apiEndpoint: testData.apiEndpointWithToken }]
      });
      await loginBtn.auth.switchTo(null);
      expect(loginBtn.auth.currentProfile()).to.deep.equal({ username: testData.username });
      // already on the own account: nothing to do
      await loginBtn.auth.switchTo(null);
      expect(loginBtn.auth.currentProfile().username).to.equal(testData.username);
    });

    it('[LBPE] a revoked account is marked "no longer available" and asked for again', async function () {
      const revoked = testData.apiEndpointWithToken.replace(/\/\/[^@]+@/, '//revoked-token-x@');
      const { loginBtn } = await button(null, {
        username: PARENT,
        apiEndpoint: 'https://tok1@parent.example.com/',
        profiles: [{ username: testData.username, apiEndpoint: revoked, actingAs: { username: testData.username, delegate: PARENT } }]
      });
      const posted = stubAuthRequest({ response: { status: 403 }, body: { status: 'REFUSED' } });
      await loginBtn.auth.switchTo(testData.username);
      await settle();
      expect(posted[0].actAs).to.equal(testData.username);
      const listed = loginBtn.auth.profiles().find((p) => p.username === testData.username);
      expect(listed.available).to.equal(false);
      // the sign-in was refused: back on the previous account, not signed out
      expect(loginBtn.auth.state.status).to.equal(AuthStates.AUTHORIZED);
      expect(loginBtn.auth.currentProfile().username).to.equal(PARENT);
      loginBtn.showMenu();
      const item = Array.from(dialog().querySelectorAll('.pryv-menu-profile')).find((b) => b.textContent.startsWith(testData.username));
      expect(item.textContent).to.include('no longer available');
    });

    it('[LBPF] the menu offers the remembered accounts, "another account" with delegation, and "Log out of all accounts"', async function () {
      const { loginBtn } = await button(null, {
        username: PARENT,
        apiEndpoint: 'https://tok1@parent.example.com/',
        profiles: [{ username: KIM, apiEndpoint: 'https://tok2@kim.example.com/', actingAs: { username: KIM, delegate: PARENT } }]
      });
      loginBtn.serviceInfo = Object.assign({}, loginBtn.serviceInfo, { features: { delegation: true } });
      loginBtn.showMenu();
      const items = Array.from(dialog().querySelectorAll('.pryv-menu-profile'));
      expect(items.map((b) => b.textContent)).to.deep.equal([PARENT + ' (me)', KIM + ' via ' + PARENT]);
      expect(items[0].getAttribute('aria-current')).to.equal('true');
      expect(dialog().querySelector('.pryv-menu-switch-title').textContent).to.equal('Use this app for');
      expect(dialog().querySelector('.pryv-menu-add-account')).to.exist;
      expect(dialog().querySelector('.pryv-menu-logout-all')).to.exist;
      loginBtn.closeMenu();
      // hidden with the option; nothing to offer without delegation and a single account
      const { loginBtn: hidden } = await button({ menu: { hide: ['switch'] } }, { username: PARENT, apiEndpoint: 'https://tok1@parent.example.com/', profiles: [{ username: KIM, apiEndpoint: 'https://tok2@kim.example.com/' }] });
      hidden.showMenu();
      expect(dialog().querySelector('.pryv-menu-switch')).to.equal(null);
      hidden.closeMenu();
      const { loginBtn: single } = await button(null, { username: PARENT, apiEndpoint: 'https://tok1@parent.example.com/' });
      single.serviceInfo = Object.assign({}, single.serviceInfo, { features: { delegation: false } });
      single.showMenu();
      expect(dialog().querySelector('.pryv-menu-switch')).to.equal(null);
      expect(dialog().querySelector('.pryv-menu-logout-all')).to.equal(null);
    });

    it('[LBPG] acting for an account: the menu says so and offers "Switch back"', async function () {
      const { loginBtn } = await button(null, {
        username: KIM,
        apiEndpoint: 'https://tok2@kim.example.com/',
        actingAs: { username: KIM, delegate: testData.username },
        profiles: [{ username: testData.username, apiEndpoint: testData.apiEndpointWithToken }]
      });
      loginBtn.showMenu();
      expect(dialog().querySelector('.pryv-menu-username').textContent).to.equal(KIM + ' (acting as, via ' + testData.username + ')');
      expect(dialog().querySelector('.pryv-menu-account').textContent).to.include("Manage kim-doe's account");
      expect(dialog().querySelector('.pryv-menu-profile')).to.equal(null);
      dialog().querySelector('.pryv-menu-switch-back').click();
      expect(dialog()).to.equal(null);
      await loginBtn.pending;
      expect(loginBtn.auth.currentProfile()).to.deep.equal({ username: testData.username });
    });

    it('[LBPH] "Log out" keeps the other accounts without signing in to one; "Log out of all accounts" forgets them', async function () {
      const stored = {
        username: KIM,
        apiEndpoint: 'https://tok2@kim.example.com/',
        profiles: [{ username: PARENT, apiEndpoint: 'https://tok1@parent.example.com/' }]
      };
      const { loginBtn, states } = await button(null, stored);
      loginBtn.showMenu();
      dialog().querySelector('.pryv-menu-logout').click();
      await loginBtn.pending;
      expect(states.filter((s) => s.status === AuthStates.SIGNOUT)).to.have.lengthOf(1);
      expect(loginBtn.auth.state.status).to.equal(AuthStates.INITIALIZED);
      const kept = loginBtn.getAuthorizationData();
      expect(kept.username).to.equal(undefined);
      expect(kept.profiles.map((p) => p.username)).to.deep.equal([PARENT]);

      const { loginBtn: all } = await button(null, stored);
      all.showMenu();
      dialog().querySelector('.pryv-menu-logout-all').click();
      await all.pending;
      const cleared = all.getAuthorizationData();
      expect(cleared == null || cleared.deleted === true).to.equal(true);
    });

    it('[LBPI] a failed re-initialization after a dismissed "Log out?" is handled, not left rejected', async function () {
      const { loginBtn } = await button({ menu: false }, { username: PARENT, apiEndpoint: 'https://tok1@parent.example.com/' });
      loginBtn.onClick();
      await settle();
      loginBtn.auth.init = async () => { throw new Error('offline'); };
      await loginBtn.closeMenu();
    });
  });

  describe('[LBWX] Without spanButtonID', function () {
    it('[LBWA] init works without span (logs warning)', async function () {
      const settings = {
        authRequest: {
          requestingAppId: 'test-app-no-span',
          requestedPermissions: []
        }
      };
      const loginBtn = new LoginButton(settings, service);
      await loginBtn.init();
      expect(loginBtn.loginButtonSpan).to.be.null;
    });
  });
});
