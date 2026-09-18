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
      document.querySelector('.pryv-menu-overlay').click();
      expect(dialog()).to.equal(null);
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
      expect(document.querySelectorAll('link[rel="stylesheet"]').length).to.be.at.most(1);
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
