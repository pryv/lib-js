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

    it('[ACVE] defaults the request to shared-secret credential hand-off', function () {
      const settings = { authRequest: { requestingAppId: 'test-app', requestedPermissions: [] } };
      // eslint-disable-next-line no-new
      new AuthController(settings, service);
      expect(settings.authRequest.credentialHandoff).to.equal('shared-secret');
    });

    it('[ACVF] credentialHandoff:\'inline\' opts out and sends no field', function () {
      const settings = { authRequest: { requestingAppId: 'test-app', requestedPermissions: [], credentialHandoff: 'inline' } };
      // eslint-disable-next-line no-new
      new AuthController(settings, service);
      expect(settings.authRequest).to.not.have.property('credentialHandoff');
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

  describe('[ACUX] account app URL and signOut', function () {
    function controller (extraSettings) {
      return new AuthController(Object.assign({
        authRequest: { requestingAppId: 'test-app', requestedPermissions: [] }
      }, extraSettings), service);
    }
    const profile = (base) => base + '/account/profile?pryvServiceInfoUrl=' + encodeURIComponent(testData.serviceInfoUrl);

    it('[ACUA] resolves settings.accountUrl, then the service account, then the auth page URL', async function () {
      const auth = controller({ accountUrl: 'https://own.example.com/' });
      await auth.init();
      auth.serviceInfo = Object.assign({}, auth.serviceInfo, { account: 'https://account.example.com' });
      auth._authUrl = 'https://ui.example.com/auth?key=abc';
      expect(auth.accountUrl()).to.equal(profile('https://own.example.com'));
      delete auth.settings.accountUrl;
      expect(auth.accountUrl()).to.equal(profile('https://account.example.com'));
      delete auth.serviceInfo.account;
      expect(auth.accountUrl()).to.equal(profile('https://ui.example.com'));
    });

    it('[ACUB] is null when nothing names the account app', async function () {
      const auth = controller();
      await auth.init();
      auth.serviceInfo = Object.assign({}, auth.serviceInfo);
      delete auth.serviceInfo.account;
      expect(auth.accountUrl()).to.equal(null);
      for (const authUrl of ['https://ui.example.com/access/login?key=x', 'not a url', 'https://ui.example.com/authorize']) {
        auth._authUrl = authUrl;
        expect(auth.accountUrl(), authUrl).to.equal(null);
      }
    });

    it('[ACUC] openAccountApp opens the profile page in a new tab without an opener', async function () {
      const auth = controller({ accountUrl: 'https://own.example.com' });
      await auth.init();
      const opened = [];
      const original = window.open;
      window.open = (...args) => { opened.push(args); return null; };
      try {
        expect(auth.openAccountApp()).to.equal(profile('https://own.example.com'));
      } finally { window.open = original; }
      expect(opened).to.deep.equal([[profile('https://own.example.com'), '_blank', 'noopener']]);
    });

    it('[ACUD] signOut emits SIGNOUT once, clears the stored credentials and re-initializes', async function () {
      const states = [];
      let deleted = 0;
      const button = {
        getAuthorizationData: () => null,
        deleteAuthorizationData: async () => { deleted++; },
        onStateChange: async () => {},
        onClick: () => {}
      };
      const auth = new AuthController({
        authRequest: { requestingAppId: 'test-app', requestedPermissions: [] },
        onStateChange: (s) => states.push(s.status)
      }, service, button);
      await auth.init();
      auth._state = { status: AuthStates.AUTHORIZED, username: 'u' };
      states.length = 0;
      await auth.signOut();
      expect(states.filter((s) => s === AuthStates.SIGNOUT)).to.have.lengthOf(1);
      expect(deleted).to.equal(1);
      expect(auth.state.status).to.equal(AuthStates.INITIALIZED);
    });

    it('[ACUF] the auth page URL of a sign-in locates the account app, and survives a reload', async function () {
      const utils = require('../src/utils');
      const { fetchPost, fetchGet } = utils;
      utils.fetchPost = async () => ({ response: { ok: true }, body: { status: AuthStates.NEED_SIGNIN, key: 'k1', poll: 'https://core.example.com/reg/access/k1', poll_rate_ms: 1, authUrl: 'https://ui.example.com/auth?key=k1' } });
      utils.fetchGet = async () => ({ response: { status: 200 }, body: { status: AuthStates.AUTHORIZED, username: 'u', token: 't', apiEndpoint: 'https://t@u.example.com/' } });
      let saved = null;
      const button = {
        getAuthorizationData: () => saved,
        saveAuthorizationData: (d) => { saved = d; },
        onStateChange: async (state) => {
          if (state.status === AuthStates.AUTHORIZED) saved = { apiEndpoint: state.apiEndpoint, username: state.username, authUrl: auth._authUrl };
        },
        onClick: () => {}
      };
      const auth = new AuthController({ authRequest: { requestingAppId: 'test-app', requestedPermissions: [] } }, service, button);
      try {
        await auth.init();
        auth.serviceInfo = Object.assign({}, auth.serviceInfo, { account: undefined });
        await auth.startAuthRequest();
      } finally { utils.fetchPost = fetchPost; utils.fetchGet = fetchGet; }
      expect(auth.accountUrl()).to.equal(profile('https://ui.example.com'));

      // a new page load: only the stored data is known
      const reloaded = new AuthController({ authRequest: { requestingAppId: 'test-app', requestedPermissions: [] } }, service, button);
      await reloaded.init();
      reloaded.serviceInfo = Object.assign({}, reloaded.serviceInfo, { account: undefined });
      expect(reloaded.state.status).to.equal(AuthStates.AUTHORIZED);
      expect(reloaded.accountUrl()).to.equal(profile('https://ui.example.com'));
    });

    it('[ACUE] a button with showMenu gets the click instead of SIGNOUT, unless it declines', async function () {
      for (const [answer, expectSignout] of [[true, false], [undefined, false], [false, true]]) {
        const states = [];
        let menus = 0;
        const button = {
          getAuthorizationData: () => null,
          onStateChange: async () => {},
          onClick: () => {},
          showMenu: () => { menus++; return answer; }
        };
        const auth = new AuthController({
          authRequest: { requestingAppId: 'test-app', requestedPermissions: [] },
          onStateChange: (s) => states.push(s.status)
        }, service, button);
        await auth.init();
        auth._state = { status: AuthStates.AUTHORIZED };
        await auth.handleClick();
        expect(menus).to.equal(1);
        expect(states.includes(AuthStates.SIGNOUT), 'showMenu returned ' + answer).to.equal(expectSignout);
      }
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

  describe('[ACGX] credential hand-off polling', function () {
    let realFetch;
    let handoffKeyCounter = 0;

    /** Stub the whole flow: access POST -> NEED_SIGNIN, poll GET -> pollBody,
     *  shared-secrets/retrieve -> retrieveResponse. */
    function stubFlow (pollBody, retrieveResponse) {
      realFetch = global.fetch;
      global.fetch = async function (url, options) {
        const u = String(url);
        if (u.includes('shared-secrets/retrieve')) {
          return {
            ok: retrieveResponse.ok !== false,
            status: retrieveResponse.status || 200,
            json: async () => retrieveResponse.body
          };
        }
        if (options && options.method === 'POST' && u.includes('/access')) {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              status: 'NEED_SIGNIN',
              key: 'ho-key-' + (++handoffKeyCounter),
              poll: 'https://reg.test.local/access/pk' + handoffKeyCounter,
              poll_rate_ms: 5
            })
          };
        }
        if (u.includes('/access/')) { // the poll GET
          return { ok: true, status: 200, json: async () => pollBody };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      };
    }

    afterEach(function () {
      if (realFetch) global.fetch = realFetch;
      realFetch = null;
    });

    function makeAuth () {
      const auth = new AuthController({
        authRequest: { requestingAppId: 'test-app', requestedPermissions: [] }
      }, service);
      // Skip init() (asset loading): set the service info the flow needs.
      auth.serviceInfo = { access: 'https://reg.test.local/access', register: 'https://reg.test.local/' };
      return auth;
    }

    it('[ACGA] redeems a hand-off ACCEPTED body and rewrites the internal state to the legacy shape (token, no handoff)', async function () {
      stubFlow(
        { status: 'ACCEPTED', username: 'eve', apiEndpoint: 'https://eve.test.local/', handoff: { type: 'shared-secret', key: 'evt.' + 'e'.repeat(40) } },
        { body: { secret: { username: 'eve', token: 'tok-eve', apiEndpoint: 'https://eve.test.local/' } } }
      );
      const auth = makeAuth();
      await auth.startAuthRequest();
      expect(auth.state.status).to.equal(AuthStates.AUTHORIZED);
      expect(auth.state.token).to.equal('tok-eve');
      expect(auth.state.apiEndpoint).to.contain('tok-eve@');
      expect(auth.state.apiEndpoint).to.contain('eve.test.local');
      // The one-time key must not survive into the state the cookie/listener see.
      expect(auth.state.handoff).to.equal(undefined);
    });

    it('[ACGB] a failed hand-off retrieve puts the controller in ERROR, not a broken AUTHORIZED', async function () {
      stubFlow(
        { status: 'ACCEPTED', username: 'frank', apiEndpoint: 'https://frank.test.local/', handoff: { type: 'shared-secret', key: 'evt.' + 'f'.repeat(40) } },
        { ok: false, status: 403, body: { error: { id: 'forbidden', message: 'used', data: { id: 'shared-secret-unavailable' } } } }
      );
      const auth = makeAuth();
      await auth.startAuthRequest();
      expect(auth.state.status).to.equal(AuthStates.ERROR);
      expect(auth.state.token).to.equal(undefined);
    });
  });
});
