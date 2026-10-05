/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, beforeEach, afterEach, expect */

const AuthController = require('../src/Auth/AuthController');
const AuthStates = require('../src/Auth/AuthStates');
const utils = require('../src/utils');

/**
 * [APLX] What the popup (polling) path delivers to the app's onStateChange
 * when the auth request ends. No platform needed: the access POST and the
 * poll GET are stubbed.
 */
describe('[APLX] AuthController popup poll outcome', function () {
  const SERVICE_INFO = { access: 'https://reg.test.local/access/', name: 'Test' };
  const POLL = 'https://core-a.test.local/reg/access/plk1';
  let saved;
  let pollBody;
  let pollStatus;

  beforeEach(() => {
    saved = { fetchPost: utils.fetchPost, fetchGet: utils.fetchGet };
    utils.fetchPost = async () => ({
      response: { ok: true, status: 201 },
      body: { status: 'NEED_SIGNIN', key: 'plk1', poll: POLL, poll_rate_ms: 5, authUrl: 'https://ui.test.local/auth?key=plk1' }
    });
    utils.fetchGet = async () => ({ response: { ok: pollStatus < 400, status: pollStatus }, body: pollBody });
  });

  afterEach(() => {
    utils.fetchPost = saved.fetchPost;
    utils.fetchGet = saved.fetchGet;
  });

  /** A controller past init(): INITIALIZED, as the sign-in button shows it. */
  function makeAuth (onStateChange) {
    const auth = new AuthController({
      onStateChange,
      authRequest: { requestingAppId: 'apl-app', requestedPermissions: [], credentialHandoff: 'inline' }
    }, { infoSync: () => SERVICE_INFO });
    auth.serviceInfo = SERVICE_INFO;
    auth.state = { status: AuthStates.INITIALIZED, serviceInfo: SERVICE_INFO };
    return auth;
  }

  it('[APL1] a refused request emits REFUSED with the reasonId and message, then INITIALIZED', async () => {
    pollStatus = 403;
    pollBody = { status: 'REFUSED', reasonId: 'REFUSED_MANDATORY_CONSENT', message: 'A mandatory consent was declined' };
    const seen = [];
    const auth = makeAuth((s) => seen.push(s));
    await auth.startAuthRequest();

    expect(seen.map((s) => s.status)).to.deep.equal(['INITIALIZED', 'NEED_SIGNIN', 'REFUSED', 'INITIALIZED']);
    // the core's answer, nothing more (no key of the refused request)
    expect(seen[2]).to.deep.equal({
      status: 'REFUSED',
      id: 'REFUSED',
      reasonId: 'REFUSED_MANDATORY_CONSENT',
      message: 'A mandatory consent was declined',
      serviceInfo: SERVICE_INFO
    });
    expect(seen[3]).to.deep.equal({ status: 'INITIALIZED', id: 'INITIALIZED', serviceInfo: SERVICE_INFO });
  });

  it('[APL2] after a refusal the button is back to its initial state: a click starts a new request', async () => {
    pollStatus = 403;
    pollBody = { status: 'REFUSED', reasonId: 'REFUSED_BY_USER', message: 'access refused by user' };
    const auth = makeAuth(() => {});
    await auth.startAuthRequest();
    expect(auth.state.status).to.equal(AuthStates.INITIALIZED);

    let started = 0;
    auth.startAuthRequest = async () => { started++; };
    await auth.handleClick();
    expect(started).to.equal(1);
  });

  it('[APL3] a listener that starts over on REFUSED is not overridden by the reset', async () => {
    pollStatus = 403;
    pollBody = { status: 'REFUSED', reasonId: 'REFUSED_BY_USER' };
    let auth = null;
    auth = makeAuth((s) => {
      if (s.status === 'REFUSED') auth.stopAuthRequest('stopped by the app');
    });
    await auth.startAuthRequest();
    expect(auth.state.status).to.equal(AuthStates.ERROR);
    expect(auth.state.message).to.equal('stopped by the app');
  });

  it('[APL4] an account switch that is refused keeps the previous account', async () => {
    pollStatus = 403;
    pollBody = { status: 'REFUSED', reasonId: 'REFUSED_BY_USER' };
    const seen = [];
    const auth = makeAuth((s) => seen.push(s.status));
    const previous = { status: AuthStates.AUTHORIZED, username: 'bob', apiEndpoint: 'https://tb@bob.test.local/' };
    const warn = console.warn;
    console.warn = () => {};
    try {
      await auth.startAuthRequest({ actAs: 'allow' }, previous);
    } finally {
      console.warn = warn;
    }
    expect(auth.state.status).to.equal(AuthStates.AUTHORIZED);
    expect(auth.state.username).to.equal('bob');
    expect(seen.slice(-2)).to.deep.equal(['NEED_SIGNIN', 'ACCEPTED']);
  });

  it('[APL5] ACCEPTED keeps cmcInvites and delegation for the app; the credentials stay inside', async () => {
    pollStatus = 200;
    const cmcInvites = [
      { acceptEventId: 'evt-1', dataGrantAccessId: 'acc-1' },
      { declined: true },
      { acceptEventId: 'evt-3', acceptedFor: 'self' }
    ];
    const delegation = { isDelegatedAccess: true, controlledUsername: 'kim', delegate: { username: 'alice' } };
    pollBody = { status: 'ACCEPTED', username: 'kim', token: 'tok-kim', apiEndpoint: 'https://tok-kim@kim.test.local/', cmcInvites, delegation };
    const seen = [];
    const auth = makeAuth((s) => seen.push(s));
    await auth.startAuthRequest();

    const accepted = seen[seen.length - 1];
    expect(accepted).to.deep.equal({ status: 'ACCEPTED', id: 'ACCEPTED', key: 'plk1', cmcInvites, delegation });
    expect(auth.state.token).to.equal('tok-kim');
  });

  it('[APL7] a switch back to the signed-in account sends no actAsManagedOnly (it sends actAs: \'deny\')', async () => {
    pollStatus = 403;
    pollBody = { status: 'REFUSED', reasonId: 'REFUSED_BY_USER' };
    const posted = [];
    utils.fetchPost = async (url, body) => {
      posted.push(body);
      return {
        response: { ok: true, status: 201 },
        body: { status: 'NEED_SIGNIN', key: 'plk1', poll: POLL, poll_rate_ms: 5, authUrl: 'https://ui.test.local/auth?key=plk1' }
      };
    };
    const auth = new AuthController({
      onStateChange: () => {},
      authRequest: { requestingAppId: 'apl-app', requestedPermissions: [], credentialHandoff: 'inline', actAs: 'allow', actAsManagedOnly: true }
    }, { infoSync: () => SERVICE_INFO });
    auth.serviceInfo = SERVICE_INFO;
    auth.state = { status: AuthStates.AUTHORIZED, username: 'kim', apiEndpoint: 'https://tk@kim.test.local/', profile: { username: 'kim', actingAs: { username: 'kim', delegate: 'alice' } } };
    const warn = console.warn;
    console.warn = () => {};
    try {
      await auth.switchTo(null);
      // the other requests keep it: one more account, or a managed account by name
      await auth.addAccount();
      await auth.startAuthRequest({ actAs: 'kim' });
    } finally {
      console.warn = warn;
    }
    expect(posted).to.have.lengthOf(3);
    expect(posted[0].actAs).to.equal('deny');
    expect(posted[0]).to.not.have.property('actAsManagedOnly');
    expect(posted[1].actAs).to.equal('allow');
    expect(posted[1].actAsManagedOnly).to.equal(true);
    expect(posted[2].actAs).to.equal('kim');
    expect(posted[2].actAsManagedOnly).to.equal(true);
    // the app's settings are left untouched
    expect(auth.settings.authRequest.actAsManagedOnly).to.equal(true);
  });

  /** Runs `fn`, then collects the promise rejections nobody handled. */
  async function unhandledDuring (fn) {
    const saved = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');
    const seen = [];
    const onUnhandled = (reason) => seen.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      await fn();
      await new Promise((resolve) => setTimeout(resolve, 20));
    } finally {
      process.removeListener('unhandledRejection', onUnhandled);
      saved.forEach((l) => process.on('unhandledRejection', l));
    }
    return seen;
  }

  it('[APL8] a click whose access request fails shows ERROR and leaves no unhandled rejection', async () => {
    utils.fetchPost = async () => ({
      response: { ok: false, status: 500 },
      body: { error: { id: 'unexpected-error', message: 'boom' } }
    });
    const seen = [];
    const auth = makeAuth((s) => seen.push(s.status));
    const unhandled = await unhandledDuring(() => auth.handleClick());
    expect(unhandled).to.deep.equal([]);
    expect(auth.state.status).to.equal(AuthStates.ERROR);
    expect(auth.state.message).to.equal('Requesting access');
    expect(seen).to.deep.equal(['INITIALIZED', 'ERROR']);
  });

  it('[APL9] a click on ERROR whose re-initialization fails shows ERROR; the sign-in button leaves no unhandled rejection', async () => {
    const LoginButton = require('../src/Browser/LoginButton');
    const failure = new Error('storage unavailable');
    const loginButton = {
      onStateChange () {},
      getAuthorizationData () { throw failure; }
    };
    const auth = new AuthController({
      authRequest: { requestingAppId: 'apl-app', requestedPermissions: [], credentialHandoff: 'inline' }
    }, { infoSync: () => SERVICE_INFO, assets: async () => ({}) }, loginButton);
    auth.state = { status: AuthStates.ERROR, message: 'Requesting access' };

    let rejected = null;
    await auth.handleClick().catch((e) => { rejected = e; });
    expect(rejected).to.equal(failure);
    expect(auth.state.status).to.equal(AuthStates.ERROR);
    expect(auth.state.message).to.equal('Initializing');
    expect(auth.state.error).to.equal(failure);

    // the button's click handler awaits nobody: the rejection must not escape
    const warn = console.warn;
    const warned = [];
    console.warn = (...args) => warned.push(args);
    let unhandled;
    try {
      unhandled = await unhandledDuring(() => LoginButton.prototype.onClick.call({ auth }));
      expect(warned).to.deep.equal([]); // already shown as ERROR
      // any other failure is logged
      const other = { state: { status: AuthStates.INITIALIZED }, handleClick: async () => { throw failure; } };
      const unhandledOther = await unhandledDuring(() => LoginButton.prototype.onClick.call({ auth: other }));
      expect(unhandledOther).to.deep.equal([]);
      expect(warned).to.have.lengthOf(1);
      expect(warned[0][1]).to.equal(failure);
    } finally {
      console.warn = warn;
    }
    expect(unhandled).to.deep.equal([]);
  });

  it('[APL6] ACCEPTED without invites nor delegation stays { status, id, key }', async () => {
    pollStatus = 200;
    pollBody = { status: 'ACCEPTED', username: 'alice', token: 'tok', apiEndpoint: 'https://tok@alice.test.local/' };
    const seen = [];
    const auth = makeAuth((s) => seen.push(s));
    await auth.startAuthRequest();
    expect(seen[seen.length - 1]).to.deep.equal({ status: 'ACCEPTED', id: 'ACCEPTED', key: 'plk1' });
  });
});
