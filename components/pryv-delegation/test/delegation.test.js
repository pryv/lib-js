/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const pryv = require('pryv');
const delegation = require('../src');
const { Delegation, DelegationError, errorIds, STATUS } = delegation;

/**
 * Stub Connection — records (method, params, expectedKey) calls and replays
 * canned responses from a per-method handler. Mirrors enough of the real
 * `pryv.Connection.apiOne` surface for unit tests:
 *   apiOne(method, params, expectedKey) → result[expectedKey] (or full result)
 *
 * A handler may return `{ __error: { id, message, data } }` to simulate the
 * real client's throw shape: `apiOne` rejects with a PryvError-like error
 * whose `innerObject` is the batch call's `error` object.
 */
function makeStubConnection (options) {
  options = options || {};
  const handlers = options.handlers || {};
  const calls = [];
  return {
    calls,
    async apiOne (method, params, expectedKey) {
      calls.push({ method, params, expectedKey });
      const handler = handlers[method];
      if (handler == null) {
        throw new Error('stubConnection: no handler for method "' + method + '"');
      }
      const result = typeof handler === 'function' ? await handler(params, calls.length - 1) : handler;
      if (result && result.__error) {
        const e = new Error(result.__error.message || 'api error');
        e.innerObject = result.__error;
        throw e;
      }
      if (expectedKey != null) {
        if (result == null || result[expectedKey] == null) {
          throw new Error('stubConnection: missing expectedKey "' + expectedKey + '"');
        }
        return result[expectedKey];
      }
      return result;
    }
  };
}

describe('[DELX] @pryv/delegation Level-0 surface', function () {
  describe('[DELXS] STATUS constants', function () {
    it('[DELXSA] exposes the frozen relationship-status enum', function () {
      expect(STATUS).to.be.frozen;
      expect(STATUS.INVITE).to.equal('invite');
      expect(STATUS.ACTIVE).to.equal('active');
      expect(STATUS.STALE).to.equal('stale');
    });
  });

  describe('[DELXE] errorIds catalogue', function () {
    it('[DELXEA] is frozen + mirrors the server delegation-* ids', function () {
      expect(errorIds).to.be.frozen;
      expect(errorIds.GENUINE_LOGIN_REQUIRED).to.equal('delegation-genuine-login-required');
      expect(errorIds.NOT_ACTIVE).to.equal('delegation-not-active');
      expect(errorIds.ALREADY_EXISTS).to.equal('delegation-already-exists');
      expect(errorIds.USERNAME_TAKEN).to.equal('delegation-username-taken');
      expect(errorIds.UNKNOWN_CORE).to.equal('delegation-unknown-core');
      expect(errorIds.INVITE_EXPIRED).to.equal('delegation-invite-expired');
      expect(errorIds.UNKNOWN_USERNAME).to.equal('delegation-unknown-username');
      expect(errorIds.SELF_NOT_ALLOWED).to.equal('delegation-self-not-allowed');
      expect(errorIds.MIRROR_NOT_STALE).to.equal('delegation-mirror-not-stale');
    });

    it('[DELXEB] every id is kebab-case under the delegation- namespace', function () {
      for (const id of Object.values(errorIds)) {
        expect(id).to.match(/^delegation-[a-z-]+$/);
      }
    });
  });

  describe('[DELXC] DelegationError', function () {
    it('[DELXCA] carries id + cause + data', function () {
      const cause = new Error('boom');
      const err = new DelegationError('nope', errorIds.NOT_ACTIVE, cause, { peerStatus: 410 });
      expect(err).to.be.instanceOf(Error);
      expect(err.name).to.equal('DelegationError');
      expect(err.id).to.equal('delegation-not-active');
      expect(err.cause).to.equal(cause);
      expect(err.data).to.deep.equal({ peerStatus: 410 });
    });
  });

  describe('[DELXF] fromConnection', function () {
    it('[DELXFA] wraps a connection; requires one', function () {
      const conn = makeStubConnection();
      const d = Delegation.fromConnection(conn);
      expect(d).to.be.instanceOf(Delegation);
      expect(d.connection).to.equal(conn);
      expect(() => Delegation.fromConnection(null)).to.throw();
    });
  });
});

describe('[DELM] @pryv/delegation method → endpoint mapping', function () {
  describe('[DELMB] B-side (controlled account)', function () {
    it('[DELMBA] requestAttach posts delegations.requestAttach with delegateUsername', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.requestAttach': function (params) {
            return {
              delegation: {
                relId: 'rel-1',
                delegate: { username: params.delegateUsername },
                status: 'invite',
                requestedAt: 1000,
                expiresAt: 2000
              }
            };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      const rec = await d.requestAttach('bob');
      expect(conn.calls).to.have.length(1);
      expect(conn.calls[0].method).to.equal('delegations.requestAttach');
      expect(conn.calls[0].params).to.deep.equal({ delegateUsername: 'bob' });
      expect(conn.calls[0].expectedKey).to.equal('delegation');
      expect(rec.relId).to.equal('rel-1');
      expect(rec.status).to.equal(STATUS.INVITE);
      expect(rec.delegate.username).to.equal('bob');
    });

    it('[DELMBB] cancelInvite posts delegations.cancelInvite with username', async function () {
      const conn = makeStubConnection({ handlers: { 'delegations.cancelInvite': function () { return {}; } } });
      const d = Delegation.fromConnection(conn);
      await d.cancelInvite('bob');
      expect(conn.calls[0].method).to.equal('delegations.cancelInvite');
      expect(conn.calls[0].params).to.deep.equal({ username: 'bob' });
    });

    it('[DELMBC] listDelegates returns the delegates array incl. status', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.listDelegates': function () {
            return {
              delegates: [
                { relId: 'r1', delegate: { username: 'a', hostSlug: 'pryv-me' }, status: 'active', requestedAt: 1, activatedAt: 2 },
                { relId: 'r2', delegate: { username: 'b', hostSlug: 'pryv-me' }, status: 'invite', requestedAt: 3 }
              ]
            };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      const list = await d.listDelegates();
      expect(conn.calls[0].method).to.equal('delegations.listDelegates');
      expect(conn.calls[0].expectedKey).to.equal('delegates');
      expect(list).to.have.length(2);
      expect(list[0].status).to.equal(STATUS.ACTIVE);
      expect(list[1].status).to.equal(STATUS.INVITE);
    });

    it('[DELMBD] detachDelegate posts delegations.detachDelegate with username', async function () {
      const conn = makeStubConnection({ handlers: { 'delegations.detachDelegate': function () { return {}; } } });
      const d = Delegation.fromConnection(conn);
      await d.detachDelegate('bob');
      expect(conn.calls[0].method).to.equal('delegations.detachDelegate');
      expect(conn.calls[0].params).to.deep.equal({ username: 'bob' });
    });
  });

  describe('[DELMA] A-side (delegate)', function () {
    it('[DELMAA] acceptAttach posts delegations.acceptAttach with username', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.acceptAttach': function (params) {
            return { delegation: { relId: 'rel-9', controlled: { username: params.username }, status: 'active', activatedAt: 5 } };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      const rec = await d.acceptAttach('kid');
      expect(conn.calls[0].method).to.equal('delegations.acceptAttach');
      expect(conn.calls[0].params).to.deep.equal({ username: 'kid' });
      expect(conn.calls[0].expectedKey).to.equal('delegation');
      expect(rec.status).to.equal(STATUS.ACTIVE);
      expect(rec.controlled.username).to.equal('kid');
    });

    it('[DELMAB] refuseAttach posts delegations.refuseAttach with username', async function () {
      const conn = makeStubConnection({ handlers: { 'delegations.refuseAttach': function () { return {}; } } });
      const d = Delegation.fromConnection(conn);
      await d.refuseAttach('kid');
      expect(conn.calls[0].method).to.equal('delegations.refuseAttach');
      expect(conn.calls[0].params).to.deep.equal({ username: 'kid' });
    });

    it('[DELMAC] listControlled returns the controlled array incl. stale status', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.listControlled': function () {
            return {
              controlled: [
                { relId: 'r1', controlled: { username: 'kid', hostSlug: 'pryv-me' }, status: 'active', requestedAt: 1, activatedAt: 2 },
                { relId: 'r2', controlled: { username: 'old', hostSlug: 'pryv-me' }, status: 'stale', requestedAt: 3 }
              ]
            };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      const list = await d.listControlled();
      expect(conn.calls[0].method).to.equal('delegations.listControlled');
      expect(conn.calls[0].expectedKey).to.equal('controlled');
      expect(list).to.have.length(2);
      expect(list[1].status).to.equal(STATUS.STALE);
    });

    it('[DELMAD] dismissControlled posts delegations.dismissControlled with username', async function () {
      const conn = makeStubConnection({ handlers: { 'delegations.dismissControlled': function () { return {}; } } });
      const d = Delegation.fromConnection(conn);
      await d.dismissControlled('old');
      expect(conn.calls[0].method).to.equal('delegations.dismissControlled');
      expect(conn.calls[0].params).to.deep.equal({ username: 'old' });
    });

    it('[DELMAE] getToken returns { token, apiEndpoint }', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.getToken': function (params) {
            expect(params).to.deep.equal({ username: 'kid' });
            return { token: 'tok-abc', apiEndpoint: 'https://kid.pryv.me/', extra: 'ignored' };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      const res = await d.getToken('kid');
      expect(res).to.deep.equal({ token: 'tok-abc', apiEndpoint: 'https://kid.pryv.me/' });
    });

    it('[DELMAF] createAccount posts delegations.createAccount + returns { delegation, apiEndpoint }', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.createAccount': function (params) {
            return {
              delegation: { relId: 'rel-new', controlled: { username: params.username, hostSlug: 'pryv-me' }, status: 'active', activatedAt: 9 },
              apiEndpoint: 'https://new.pryv.me/'
            };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      const res = await d.createAccount({ username: 'newkid', email: 'k@x.io', password: 'p', core: 'core-2' });
      expect(conn.calls[0].method).to.equal('delegations.createAccount');
      expect(conn.calls[0].params).to.deep.equal({ username: 'newkid', email: 'k@x.io', password: 'p', core: 'core-2' });
      expect(res.delegation.status).to.equal(STATUS.ACTIVE);
      expect(res.apiEndpoint).to.equal('https://new.pryv.me/');
    });

    it('[DELMAG] createAccount omits absent optional fields + requires username', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.createAccount': function () {
            return { delegation: { relId: 'r', controlled: { username: 'x' }, status: 'active' } };
          }
        }
      });
      const d = Delegation.fromConnection(conn);
      await d.createAccount({ username: 'x' });
      expect(conn.calls[0].params).to.deep.equal({ username: 'x' });
      let threw = false;
      try { await d.createAccount({}); } catch (_e) { threw = true; }
      expect(threw).to.equal(true);
    });
  });

  describe('[DELMO] openControlled round-trip', function () {
    it('[DELMOA] mints a token then builds a pryv.Connection onto the controlled account', async function () {
      const conn = makeStubConnection({
        handlers: {
          'delegations.getToken': function () {
            return { token: 'tok-xyz', apiEndpoint: 'https://kid.pryv.me/' };
          }
        }
      });
      // Use the real pryv module so the endpoint composition is exercised end-to-end.
      const d = Delegation.fromConnection(conn, { pryv });
      const controlledConn = await d.openControlled('kid');
      expect(conn.calls[0].method).to.equal('delegations.getToken');
      expect(controlledConn).to.be.instanceOf(pryv.Connection);
      expect(controlledConn.token).to.equal('tok-xyz');
      expect(controlledConn.endpoint).to.equal('https://kid.pryv.me/');
    });
  });
});

describe('[DELE] @pryv/delegation typed error surfacing', function () {
  it('[DELEA] detachDelegate surfaces delegation-genuine-login-required distinctly', async function () {
    const conn = makeStubConnection({
      handlers: {
        'delegations.detachDelegate': function () {
          return { __error: { id: 'delegation-genuine-login-required', message: 'direct login required' } };
        }
      }
    });
    const d = Delegation.fromConnection(conn);
    let err = null;
    try { await d.detachDelegate('bob'); } catch (e) { err = e; }
    expect(err).to.be.instanceOf(DelegationError);
    expect(err.id).to.equal(errorIds.GENUINE_LOGIN_REQUIRED);
  });

  it('[DELEB] getToken surfaces delegation-not-active with data payload', async function () {
    const conn = makeStubConnection({
      handlers: {
        'delegations.getToken': function () {
          return { __error: { id: 'delegation-not-active', message: 'no longer active', data: { peerStatus: 403 } } };
        }
      }
    });
    const d = Delegation.fromConnection(conn);
    let err = null;
    try { await d.getToken('kid'); } catch (e) { err = e; }
    expect(err).to.be.instanceOf(DelegationError);
    expect(err.id).to.equal(errorIds.NOT_ACTIVE);
    expect(err.data).to.deep.equal({ peerStatus: 403 });
  });

  it('[DELEC] requestAttach surfaces delegation-already-exists', async function () {
    const conn = makeStubConnection({
      handlers: {
        'delegations.requestAttach': function () {
          return { __error: { id: 'delegation-already-exists', message: 'dup' } };
        }
      }
    });
    const d = Delegation.fromConnection(conn);
    let err = null;
    try { await d.requestAttach('bob'); } catch (e) { err = e; }
    expect(err).to.be.instanceOf(DelegationError);
    expect(err.id).to.equal(errorIds.ALREADY_EXISTS);
  });

  it('[DELED] createAccount surfaces delegation-username-taken + delegation-unknown-core', async function () {
    for (const id of ['delegation-username-taken', 'delegation-unknown-core']) {
      const conn = makeStubConnection({
        handlers: { 'delegations.createAccount': function () { return { __error: { id, message: id } }; } }
      });
      const d = Delegation.fromConnection(conn);
      let err = null;
      try { await d.createAccount({ username: 'x' }); } catch (e) { err = e; }
      expect(err).to.be.instanceOf(DelegationError);
      expect(err.id).to.equal(id);
    }
  });

  it('[DELEE] acceptAttach surfaces delegation-invite-expired', async function () {
    const conn = makeStubConnection({
      handlers: {
        'delegations.acceptAttach': function () {
          return { __error: { id: 'delegation-invite-expired', message: 'gone' } };
        }
      }
    });
    const d = Delegation.fromConnection(conn);
    let err = null;
    try { await d.acceptAttach('kid'); } catch (e) { err = e; }
    expect(err).to.be.instanceOf(DelegationError);
    expect(err.id).to.equal(errorIds.INVITE_EXPIRED);
  });

  it('[DELEF] a non-delegation error passes through unchanged (not a DelegationError)', async function () {
    const conn = makeStubConnection({
      handlers: {
        'delegations.listDelegates': function () {
          return { __error: { id: 'invalid-access-token', message: 'bad token' } };
        }
      }
    });
    const d = Delegation.fromConnection(conn);
    let err = null;
    try { await d.listDelegates(); } catch (e) { err = e; }
    expect(err).to.not.be.instanceOf(DelegationError);
    expect(err.innerObject.id).to.equal('invalid-access-token');
  });
});
