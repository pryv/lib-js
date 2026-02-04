/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, JSDOM, testData */

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

    it('[LBSE] handles SIGNOUT state when confirmed', async function () {
      // Save some auth data first
      loginBtn.saveAuthorizationData({ test: 'data' });
      await loginBtn.onStateChange({ status: AuthStates.SIGNOUT });
      // Confirm is mocked to return true
    });

    it('[LBSF] handles unknown state gracefully', async function () {
      // Should log warning but not throw
      await loginBtn.onStateChange({ status: 'UNKNOWN_STATE' });
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
