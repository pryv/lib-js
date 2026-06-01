/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, JSDOM, testData */

const AuthController = require('../src/Auth/AuthController');
const AuthStates = require('../src/Auth/AuthStates');
const Service = require('../src/Service');

describe('[ACNX] AuthController', function () {
  this.timeout(15000);

  let service;
  let cleanupDom = false;

  before(async function () {
    await testData.prepare();
    service = new Service(testData.serviceInfoUrl);
    await service.info();
  });

  before(async () => {
    if (typeof document !== 'undefined') return;
    cleanupDom = true;
    const dom = new JSDOM('<!DOCTYPE html>', {
      url: 'http://localhost/'
    });
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
    global.navigator = { userAgent: 'Safari' };
  });

  after(async () => {
    if (!cleanupDom) return;
    delete global.document;
    delete global.window;
    delete global.location;
  });

  describe('[ACVX] Validation', function () {
    it('[ACVA] throws error when settings is null', function () {
      expect(() => new AuthController(null, service)).to.throw('settings cannot be null');
    });

    it('[ACVB] throws error when authRequest is missing', function () {
      expect(() => new AuthController({}, service)).to.throw('Missing settings.authRequest');
    });

    it('[ACVC] throws error when requestingAppId is missing', function () {
      expect(() => new AuthController({
        authRequest: { requestedPermissions: [] }
      }, service)).to.throw('Missing settings.authRequest.requestingAppId');
    });

    it('[ACVD] throws error when requestedPermissions is missing', function () {
      expect(() => new AuthController({
        authRequest: { requestingAppId: 'test-app' }
      }, service)).to.throw('Missing settings.authRequest.requestedPermissions');
    });
  });

  describe('[ACLX] Listeners', function () {
    it('[ACLA] calls onStateChange listener when state changes', async function () {
      const stateChanges = [];
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        },
        onStateChange: (state) => stateChanges.push(state)
      }, service);

      await auth.init();
      expect(stateChanges.length).to.be.greaterThan(0);
      expect(stateChanges[0].status).to.equal(AuthStates.LOADING);
    });

    it('[ACLB] handles listener errors gracefully', async function () {
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        },
        onStateChange: () => { throw new Error('Listener error'); }
      }, service);

      // Should not throw
      await auth.init();
      expect(auth.state).to.exist;
    });
  });

  describe('[ACHX] handleClick', function () {
    it('[ACHA] triggers SIGNOUT when authorized', async function () {
      const stateChanges = [];
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        },
        onStateChange: (state) => stateChanges.push(state)
      }, service);

      await auth.init();

      // Simulate authorized state
      auth._state = { status: AuthStates.AUTHORIZED };

      await auth.handleClick();
      const lastState = stateChanges[stateChanges.length - 1];
      expect(lastState.status).to.equal(AuthStates.SIGNOUT);
    });

    it('[ACHB] handles NEED_SIGNIN click (reopens popup)', async function () {
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      }, service);

      await auth.init();

      // Simulate NEED_SIGNIN state
      const needSigninState = { status: AuthStates.NEED_SIGNIN, authUrl: 'http://test.url' };
      auth._state = needSigninState;

      await auth.handleClick();
      // Should trigger state change with same state
      expect(auth.state.status).to.equal(AuthStates.NEED_SIGNIN);
    });
  });

  describe('[ACSX] stopAuthRequest', function () {
    it('[ACSA] sets error state with message', async function () {
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      }, service);

      await auth.init();
      auth.stopAuthRequest('Test error message');

      expect(auth.state.status).to.equal(AuthStates.ERROR);
      expect(auth.state.message).to.equal('Test error message');
    });
  });

  describe('[ACRX] returnURL', function () {
    it('[ACRA] throws on invalid returnURL trailer', function () {
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      }, service);

      expect(() => auth.getReturnURL('http://example.com')).to.throw('Last character');
    });

    it('[ACRB] handles null/undefined returnURL', function () {
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      }, service);

      // Desktop browser (Safari) returns false for auto mode
      const result = auth.getReturnURL(undefined, 'http://test.com', { userAgent: 'Safari' });
      expect(result).to.equal(false);
    });
  });

  describe('[AIST] State', function () {
    it('[AISA] state getter and setter work correctly', async function () {
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        }
      }, service);

      auth.state = { status: AuthStates.LOADING };
      expect(auth.state.status).to.equal(AuthStates.LOADING);
      expect(auth.state.id).to.equal(AuthStates.LOADING); // retro-compatibility
    });
  });

  describe('[AFLT] External listener filtering', function () {
    it('[AFLA] AUTHORIZED state passes only { status, id, key, serviceInfo } to onStateChange', function () {
      const seen = [];
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        },
        onStateChange: (state) => seen.push(state)
      }, service);

      auth.state = {
        status: AuthStates.AUTHORIZED,
        key: 'abc123',
        serviceInfo: { name: 'Test' },
        apiEndpoint: 'https://token@example.com/',
        username: 'alice',
        token: 'secret-token'
      };

      const last = seen[seen.length - 1];
      expect(last.status).to.equal(AuthStates.AUTHORIZED);
      expect(last.id).to.equal(AuthStates.AUTHORIZED);
      expect(last.key).to.equal('abc123');
      expect(last.serviceInfo).to.deep.equal({ name: 'Test' });
      // Credentials must not leak to the calling app.
      expect(last.apiEndpoint).to.equal(undefined);
      expect(last.username).to.equal(undefined);
      expect(last.token).to.equal(undefined);
    });

    it('[AFLC] AUTHORIZED state from cookie-autologin (no key) passes through unchanged', function () {
      // Mirrors `checkAutoLogin()`'s state shape: it spreads stored
      // credentials into the AUTHORIZED state without a key, since the
      // key is not persisted.
      const seen = [];
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        },
        onStateChange: (state) => seen.push(state)
      }, service);

      auth.state = {
        status: AuthStates.AUTHORIZED,
        apiEndpoint: 'https://token@example.com/',
        username: 'alice'
      };

      const last = seen[seen.length - 1];
      // Backwards-compat: existing pages building Connection directly
      // from `state.apiEndpoint` on page reload keep working.
      expect(last.apiEndpoint).to.equal('https://token@example.com/');
      expect(last.username).to.equal('alice');
    });

    it('[AFLB] non-AUTHORIZED states pass through unchanged', function () {
      const seen = [];
      const auth = new AuthController({
        authRequest: {
          requestingAppId: 'test-app',
          requestedPermissions: []
        },
        onStateChange: (state) => seen.push(state)
      }, service);

      auth.state = { status: AuthStates.ERROR, message: 'boom', error: new Error('e') };
      const last = seen[seen.length - 1];
      expect(last.status).to.equal(AuthStates.ERROR);
      expect(last.message).to.equal('boom');
    });
  });
});
