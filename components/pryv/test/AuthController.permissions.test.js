/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect, JSDOM */

const AuthController = require('../src/Auth/AuthController');
const AuthStates = require('../src/Auth/AuthStates');
const ProfileStore = require('../src/Auth/ProfileStore');
const LoginButton = require('../src/Browser/LoginButton');
const { missingPermissions, permissionsFingerprint } = require('../src/Auth/permissionsCoverage');
const PryvError = require('../src/lib/PryvError');
const utils = require('../src/utils');

/**
 * [ACOV] Whether an access covers the requested stream permissions. Pure,
 * no platform needed.
 */
describe('[ACOV] requested permissions coverage', function () {
  const req = (streamId, level) => ({ streamId, level, defaultName: streamId });
  const app = (...permissions) => ({ type: 'app', permissions });

  it('[ACOV1] levels: read < contribute < manage', function () {
    const cases = [
      ['read', 'read', true], ['read', 'contribute', true], ['read', 'manage', true],
      ['contribute', 'read', false], ['contribute', 'contribute', true], ['contribute', 'manage', true],
      ['manage', 'read', false], ['manage', 'contribute', false], ['manage', 'manage', true]
    ];
    for (const [requested, granted, covered] of cases) {
      const missing = missingPermissions([req('diary', requested)], app({ streamId: 'diary', level: granted }));
      expect(missing.length === 0, requested + ' by ' + granted).to.equal(covered);
    }
  });

  it('[ACOV2] create-only is covered by create-only, contribute and manage, not by read; none needs nothing', function () {
    for (const [granted, covered] of [['create-only', true], ['contribute', true], ['manage', true], ['read', false]]) {
      const missing = missingPermissions([req('diary', 'create-only')], app({ streamId: 'diary', level: granted }));
      expect(missing.length === 0, 'create-only by ' + granted).to.equal(covered);
    }
    // a granted create-only does not cover a requested read
    expect(missingPermissions([req('diary', 'read')], app({ streamId: 'diary', level: 'create-only' }))).to.have.lengthOf(1);
    expect(missingPermissions([req('diary', 'none')], app())).to.deep.equal([]);
  });

  it('[ACOV3] "*" covers any stream at its level; a parent stream does not cover a child; other streams do not count', function () {
    expect(missingPermissions([req('diary', 'contribute')], app({ streamId: '*', level: 'manage' }))).to.deep.equal([]);
    expect(missingPermissions([req('diary', 'contribute')], app({ streamId: '*', level: 'read' }))).to.have.lengthOf(1);
    // exact stream ids only: no parent-stream coverage
    expect(missingPermissions([req('diary-child', 'read')], app({ streamId: 'diary', level: 'manage' }))).to.have.lengthOf(1);
    expect(missingPermissions([req('diary', 'read')], app({ streamId: 'other', level: 'manage' }))).to.have.lengthOf(1);
  });

  it('[ACOV4] returns the uncovered requested entries as requested; features are ignored on both sides', function () {
    const requested = [req('a', 'read'), req('b', 'manage'), { feature: 'selfRevoke', setting: 'forbidden' }];
    const missing = missingPermissions(requested, app({ streamId: 'a', level: 'read' }, { feature: 'selfRevoke', setting: 'allowed' }));
    expect(missing).to.deep.equal([req('b', 'manage')]);
    expect(missing[0]).to.not.equal(requested[1]); // a copy
    // a requested feature alone needs nothing
    expect(missingPermissions([{ feature: 'selfRevoke', setting: 'forbidden' }], app())).to.deep.equal([]);
  });

  it('[ACOV5] a personal access covers everything; no access info covers nothing', function () {
    expect(missingPermissions([req('a', 'manage'), req('*', 'manage')], { type: 'personal', permissions: [] })).to.deep.equal([]);
    expect(missingPermissions([req('a', 'read')], null)).to.deep.equal([req('a', 'read')]);
    expect(missingPermissions(null, app())).to.deep.equal([]);
  });

  it('[ACOV6] the fingerprint depends on the streamId + level pairs only, in any order', function () {
    const fp = permissionsFingerprint([req('a', 'read'), req('b', 'manage')]);
    expect(fp).to.match(/^[0-9a-f]{8}$/);
    expect(permissionsFingerprint([{ streamId: 'b', level: 'manage' }, { feature: 'selfRevoke', setting: 'forbidden' }, req('a', 'read')])).to.equal(fp);
    expect(permissionsFingerprint([req('a', 'read'), req('b', 'contribute')])).to.not.equal(fp);
    expect(permissionsFingerprint([req('a', 'read'), req('b', 'manage'), req('c', 'read')])).to.not.equal(fp);
  });
});

/**
 * [ALPM] Sign-in from stored credentials on page load checks that the stored
 * access covers the requested permissions. No platform needed: the service,
 * the button storage and the access-info call are stubbed.
 */
describe('[ALPM] auto-login and the requested permissions', function () {
  const SERVICE_INFO = { access: 'https://reg.test.local/access/', name: 'Test' };
  const service = {
    infoSync: () => SERVICE_INFO,
    assets: async () => ({ loginButtonLoadCSS: async () => {}, loginButtonGetMessages: async () => ({ LOADING: '...' }) })
  };
  // a flat list of stream permissions, as a production app requests them
  const REQUESTED = [
    { streamId: 'demo-profile', level: 'manage', defaultName: 'Profile' },
    { streamId: 'demo-diary', level: 'manage', defaultName: 'Diary' },
    { streamId: 'demo-meals', level: 'manage', defaultName: 'Meals' },
    { streamId: 'demo-sleep', level: 'manage', defaultName: 'Sleep' },
    { streamId: 'demo-mood', level: 'manage', defaultName: 'Mood' },
    { streamId: 'demo-notes', level: 'manage', defaultName: 'Notes' },
    { streamId: ':_cmc:apps:demo-registry', level: 'manage', defaultName: 'Demo registry' }
  ];
  // the access granted before the app added the registry stream
  const OLD_ACCESS = { type: 'app', permissions: REQUESTED.slice(0, 6).map((p) => ({ streamId: p.streamId, level: p.level })) };
  const FULL_ACCESS = { type: 'app', permissions: REQUESTED.map((p) => ({ streamId: p.streamId, level: p.level })) };
  const ENDPOINT = 'https://tok1@alice.test.local/';

  /** The stored sign-in shapes: a single account (older versions), and with remembered accounts. */
  function storedShapes (extra) {
    const active = Object.assign({ username: 'alice', apiEndpoint: ENDPOINT }, extra);
    return [
      ['single account', active],
      ['remembered accounts', Object.assign({}, active, { profiles: [active] })]
    ];
  }

  /** A button with an in-memory storage, saving AUTHORIZED states as the default button does. */
  function makeButton (stored) {
    const button = {
      saved: stored,
      saves: 0,
      getAuthorizationData: () => button.saved,
      saveAuthorizationData: (d) => { button.saves++; button.saved = d; },
      deleteAuthorizationData: async () => { button.saved = null; },
      onStateChange: async (state) => {
        if (state.status !== AuthStates.AUTHORIZED || state.profile == null) return;
        button.saveAuthorizationData(ProfileStore.write(ProfileStore.activate(ProfileStore.read(button.saved), state.profile)));
      },
      onClick: () => {}
    };
    return button;
  }

  /** A controller whose access-info answers with `answer` (a value, or a function that throws). */
  function makeAuth (button, answer, requestedPermissions = REQUESTED, onStateChange) {
    const auth = new AuthController({
      onStateChange,
      authRequest: { requestingAppId: 'alpm-app', requestedPermissions, credentialHandoff: 'inline' }
    }, service, button);
    auth.accessInfoCalls = [];
    auth._accessInfo = async (apiEndpoint) => {
      auth.accessInfoCalls.push(apiEndpoint);
      return typeof answer === 'function' ? answer() : answer;
    };
    return auth;
  }

  const CURRENT_FP = permissionsFingerprint(REQUESTED);

  it('[ALPM1] a stored access that covers the request signs in, after one access-info call', async () => {
    for (const [shape, stored] of storedShapes()) {
      const auth = makeAuth(makeButton(stored), FULL_ACCESS);
      await auth.init();
      expect(auth.state.status, shape).to.equal(AuthStates.AUTHORIZED);
      expect(auth.state.missingPermissions, shape).to.equal(undefined);
      expect(auth.accessInfoCalls, shape).to.deep.equal([ENDPOINT]);
    }
  });

  it('[ALPM2] widened request, sign-in stored before it: not signed in, missingPermissions on INITIALIZED, storage kept, a click asks again', async () => {
    for (const [shape, stored] of storedShapes()) {
      const button = makeButton(stored);
      const external = [];
      const auth = makeAuth(button, OLD_ACCESS, REQUESTED, (s) => external.push(s));
      await auth.init();
      expect(auth.state.status, shape).to.equal(AuthStates.INITIALIZED);
      expect(auth.state.reasonId, shape).to.equal('MISSING_PERMISSIONS');
      expect(auth.state.missingPermissions, shape).to.deep.equal([REQUESTED[6]]);
      // the app's listener sees it too, and never an AUTHORIZED
      expect(external.map((s) => s.status), shape).to.deep.equal([AuthStates.LOADING, AuthStates.INITIALIZED]);
      expect(external[1].missingPermissions, shape).to.deep.equal([REQUESTED[6]]);
      // the stored sign-in is left as it is: the next sign-in replaces it
      expect(button.saved, shape).to.equal(stored);
      expect(button.saves, shape).to.equal(0);
      // the button is in its sign-in state: a click starts a new auth request
      let started = 0;
      auth.startAuthRequest = async () => { started++; };
      await auth.handleClick();
      expect(started, shape).to.equal(1);
    }
  });

  it('[ALPM3] stored sign-in made for this same request, still not covered: signed in with missingPermissions (no loop)', async () => {
    for (const [shape, stored] of storedShapes({ permissionsFingerprint: CURRENT_FP })) {
      const auth = makeAuth(makeButton(stored), OLD_ACCESS);
      await auth.init();
      expect(auth.state.status, shape).to.equal(AuthStates.AUTHORIZED);
      expect(auth.state.missingPermissions, shape).to.deep.equal([REQUESTED[6]]);
    }
    // made for another (older) request: blocked again
    for (const [shape, stored] of storedShapes({ permissionsFingerprint: permissionsFingerprint(REQUESTED.slice(0, 6)) })) {
      const auth = makeAuth(makeButton(stored), OLD_ACCESS);
      await auth.init();
      expect(auth.state.status, shape).to.equal(AuthStates.INITIALIZED);
      expect(auth.state.reasonId, shape).to.equal('MISSING_PERMISSIONS');
    }
  });

  it('[ALPM4] an access through account delegation is not blocked: signed in with missingPermissions', async () => {
    const delegated = Object.assign({}, OLD_ACCESS, {
      delegation: { isDelegatedAccess: true, controlledUsername: 'alice', delegate: { username: 'parent' }, grantedVia: 'app' }
    });
    for (const [shape, stored] of storedShapes()) {
      const auth = makeAuth(makeButton(stored), delegated);
      await auth.init();
      expect(auth.state.status, shape).to.equal(AuthStates.AUTHORIZED);
      expect(auth.state.missingPermissions, shape).to.deep.equal([REQUESTED[6]]);
    }
  });

  it('[ALPM5] a refused token is not signed in to; the account is kept, marked unavailable', async () => {
    for (const id of ['invalid-access-token', 'forbidden']) {
      for (const [shape, stored] of storedShapes()) {
        const button = makeButton(stored);
        const auth = makeAuth(button, { error: { id } });
        await auth.init();
        expect(auth.state.status, shape + ' ' + id).to.equal(AuthStates.INITIALIZED);
        expect(auth.state.reasonId, shape + ' ' + id).to.equal('STORED_ACCESS_REFUSED');
        const store = ProfileStore.read(button.saved);
        expect(store.active, shape + ' ' + id).to.equal(null);
        expect(store.profiles, shape + ' ' + id).to.deep.equal([{ username: 'alice', apiEndpoint: ENDPOINT, unavailable: true }]);
      }
    }
  });

  it('[ALPM6] network failure or any other answer: signed in as before (an offline start keeps the sign-in)', async () => {
    const answers = [
      () => { throw new TypeError('fetch failed'); },
      () => { throw new PryvError('unreadable answer'); },
      { error: { id: 'unexpected-error' } },
      { error: { id: 'too-many-requests' } }
    ];
    for (const answer of answers) {
      for (const [shape, stored] of storedShapes()) {
        const auth = makeAuth(makeButton(stored), answer);
        await auth.init();
        expect(auth.state.status, shape).to.equal(AuthStates.AUTHORIZED);
        expect(auth.state.missingPermissions, shape).to.equal(undefined);
        expect(auth.accessInfoCalls, shape).to.have.lengthOf(1);
      }
    }
  });

  it('[ALPM7] no access-info call when no sign-in is stored or no stream permission is requested', async () => {
    const none = makeAuth(makeButton(null), OLD_ACCESS);
    await none.init();
    expect(none.state.status).to.equal(AuthStates.INITIALIZED);
    expect(none.state.reasonId).to.equal(undefined);
    expect(none.accessInfoCalls).to.deep.equal([]);
    for (const requested of [[], [{ feature: 'selfRevoke', setting: 'forbidden' }], [{ streamId: 'x', level: 'none', defaultName: 'X' }]]) {
      const auth = makeAuth(makeButton({ username: 'alice', apiEndpoint: ENDPOINT }), { type: 'app', permissions: [] }, requested);
      await auth.init();
      expect(auth.state.status, JSON.stringify(requested)).to.equal(AuthStates.AUTHORIZED);
      expect(auth.accessInfoCalls, JSON.stringify(requested)).to.deep.equal([]);
    }
  });

  describe('[ALPMS] a sign-in through the auth request stores the fingerprint of its request', function () {
    let savedFetch;
    beforeEach(() => {
      savedFetch = { fetchPost: utils.fetchPost, fetchGet: utils.fetchGet };
      utils.fetchPost = async () => ({
        response: { ok: true, status: 201 },
        body: { status: 'NEED_SIGNIN', key: 'alk1', poll: 'https://reg.test.local/access/alk1', poll_rate_ms: 1, authUrl: 'https://ui.test.local/auth?key=alk1' }
      });
      utils.fetchGet = async () => ({ response: { ok: true, status: 200 }, body: { status: 'ACCEPTED', username: 'alice', token: 'tok2', apiEndpoint: 'https://tok2@alice.test.local/' } });
    });
    afterEach(() => {
      utils.fetchPost = savedFetch.fetchPost;
      utils.fetchGet = savedFetch.fetchGet;
    });

    it('[ALPM8] popup: re-asked, still not covered (an older core): the next page load signs in with missingPermissions', async () => {
      const button = makeButton({ username: 'alice', apiEndpoint: ENDPOINT });
      const auth = makeAuth(button, OLD_ACCESS);
      await auth.init();
      expect(auth.state.reasonId).to.equal('MISSING_PERMISSIONS');
      await auth.startAuthRequest();
      expect(auth.state.status).to.equal(AuthStates.AUTHORIZED);
      expect(ProfileStore.read(button.saved).active.permissionsFingerprint).to.equal(CURRENT_FP);

      const reloaded = makeAuth(button, OLD_ACCESS);
      await reloaded.init();
      expect(reloaded.state.status).to.equal(AuthStates.AUTHORIZED);
      expect(reloaded.state.missingPermissions).to.deep.equal([REQUESTED[6]]);
      // kept on the stored sign-in when it is saved again
      expect(ProfileStore.read(button.saved).active.permissionsFingerprint).to.equal(CURRENT_FP);
    });

    it('[ALPM9] redirect return: the profile of the sign-in carries the fingerprint', async function () {
      if (typeof JSDOM === 'undefined') this.skip();
      const GLOBALS = ['document', 'window', 'location', 'navigator'];
      const saved = {};
      for (const name of GLOBALS) saved[name] = Object.getOwnPropertyDescriptor(global, name);
      const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost/app?pryvKey=alk1' });
      global.document = dom.window.document;
      global.window = dom.window;
      global.location = dom.window.location;
      global.navigator = { userAgent: 'Safari' };
      try {
        const cookieKey = 'pryv-libjs-alpm-app';
        global.window.sessionStorage.setItem(cookieKey + '-authflow', JSON.stringify({ key: 'alk1', poll: 'https://reg.test.local/access/alk1' }));
        const authController = { serviceInfo: SERVICE_INFO, _requestedPermissionsFingerprint: () => CURRENT_FP };
        await LoginButton.prototype.finishAuthProcessAfterRedirection.call({ _cookieKey: cookieKey }, authController);
        expect(authController.state.status).to.equal(AuthStates.AUTHORIZED);
        expect(authController.state.profile).to.deep.equal({ username: 'alice', apiEndpoint: 'https://tok2@alice.test.local/', permissionsFingerprint: CURRENT_FP });
      } finally {
        for (const name of GLOBALS) {
          if (saved[name]) Object.defineProperty(global, name, saved[name]);
          else delete global[name];
        }
      }
    });
  });

  it('[ALPMA] an account switch without sign-in reports missingPermissions and keeps the stored fingerprint', async () => {
    const bob = { username: 'bob', apiEndpoint: 'https://tok3@bob.test.local/', permissionsFingerprint: 'abcdef01' };
    const stored = { username: 'alice', apiEndpoint: ENDPOINT, profiles: [{ username: 'alice', apiEndpoint: ENDPOINT }, bob] };
    const button = makeButton(stored);
    const auth = makeAuth(button, FULL_ACCESS);
    await auth.init();
    expect(auth.state.status).to.equal(AuthStates.AUTHORIZED);
    auth._accessInfo = async () => OLD_ACCESS;
    await auth.switchTo('bob');
    expect(auth.state.status).to.equal(AuthStates.AUTHORIZED);
    expect(auth.state.username).to.equal('bob');
    expect(auth.state.missingPermissions).to.deep.equal([REQUESTED[6]]);
    expect(auth.state.profile.permissionsFingerprint).to.equal('abcdef01');
  });
});

describe('[ALPMX] pryv.Auth exposes missingPermissions', function () {
  it('[ALPMB] pryv.Auth.missingPermissions and authController.missingPermissions(accessInfo)', function () {
    const Auth = require('../src/Auth');
    expect(Auth.missingPermissions).to.equal(missingPermissions);
    const auth = new AuthController({ authRequest: { requestingAppId: 'x', requestedPermissions: [{ streamId: 'a', level: 'read', defaultName: 'A' }] } }, { infoSync: () => ({}) });
    expect(auth.missingPermissions({ type: 'app', permissions: [] })).to.deep.equal([{ streamId: 'a', level: 'read', defaultName: 'A' }]);
    expect(auth.missingPermissions({ type: 'app', permissions: [{ streamId: 'a', level: 'manage' }] })).to.deep.equal([]);
  });
});
