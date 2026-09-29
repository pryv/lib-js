/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, beforeEach, after, afterEach, expect, JSDOM */

const LoginButton = require('../src/Browser/LoginButton');
const SharedSecrets = require('../src/SharedSecrets');
const handoff = require('../src/lib/handoff');
const utils = require('../src/utils');

describe('[LBRU] LoginButton URL cleanup after redirect', function () {
  const PAGE_URL = 'http://localhost/app?x=1&prYvpoll=http%3A%2F%2Flocalhost%2Fpoll%2Fkey123&prYvstatus=ACCEPTED';
  const GLOBALS = ['document', 'window', 'location', 'navigator'];
  let saved;
  let originalFetchGet;

  before(() => {
    // Always our own page: reusing a DOM left by another file would test that
    // page's URL, not PAGE_URL. Node only (a real browser run has no JSDOM).
    if (typeof JSDOM !== 'undefined') {
      saved = {};
      for (const name of GLOBALS) {
        saved[name] = Object.getOwnPropertyDescriptor(global, name);
      }
      const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: PAGE_URL });
      global.document = dom.window.document;
      global.window = dom.window;
      global.location = dom.window.location;
      global.navigator = { userAgent: 'Safari' };
    }
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
    const authController = { serviceInfo: {} };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call({}, authController);
    expect(authController.state).to.eql({ status: 'ACCEPTED' });
    expect(global.window.location.href).to.equal('http://localhost/app?x=1');
  });
});

/**
 * [LBRH] Return from a sign-in by redirection when the core delivered the
 * credentials through a one-time shared secret: the ACCEPTED poll body has a
 * token-less apiEndpoint and a `handoff` key, which must be redeemed exactly
 * as the popup (polling) path does. Observed: the state handed to the button
 * (what ends up in the cookie) and the retrieve call.
 */
describe('[LBRH] LoginButton redirect return with credential hand-off', function () {
  const GLOBALS = ['document', 'window', 'location', 'navigator'];
  const HANDOFF_BODY = () => ({
    status: 'ACCEPTED',
    username: 'alice',
    apiEndpoint: 'https://alice.test.local/',
    handoff: { type: 'shared-secret', key: 'evt1.' + 'a'.repeat(40) }
  });
  let saved;
  let originalFetchGet;
  let originalRetrieve;
  let retrieveCalls;

  function setPage (url) {
    const dom = new JSDOM('<!DOCTYPE html><body></body>', { url });
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
    originalRetrieve = SharedSecrets.retrieve;
  });

  beforeEach(() => { retrieveCalls = []; });

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

  function stub (retrieve) {
    utils.fetchGet = async () => ({ body: HANDOFF_BODY() });
    SharedSecrets.retrieve = async (apiEndpoint, key) => {
      retrieveCalls.push({ apiEndpoint, key });
      return retrieve();
    };
  }

  it('[LBH1] redeems the hand-off: token-bearing state, key kept as the flow key', async () => {
    setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey1&prYvstatus=ACCEPTED');
    stub(() => ({ secret: { username: 'alice', token: 'tok-123', apiEndpoint: 'https://alice.test.local/' } }));
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call({}, authController);

    const state = authController.state;
    expect(state.status).to.equal('ACCEPTED');
    expect(state.token).to.equal('tok-123');
    expect(state.apiEndpoint).to.equal('https://tok-123@alice.test.local/');
    expect(state.handoff).to.equal(undefined);
    expect(state.profile.apiEndpoint).to.equal('https://tok-123@alice.test.local/');
    expect(retrieveCalls).to.have.length(1);
    expect(authController._authFlowKey).to.equal('flowkey1');
    // cached under the flow key: a later connectFromKey reuses it
    expect(handoff.cacheGet('flowkey1').token).to.equal('tok-123');
    expect(global.window.location.href).to.equal('http://localhost/app');
  });

  it('[LBH2] takes the flow key from pryvKey when present', async () => {
    setPage('http://localhost/app?pryvKey=flowkey2');
    stub(() => ({ secret: { username: 'alice', token: 'tok-456', apiEndpoint: 'https://alice.test.local/' } }));
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call({}, authController);

    expect(authController.state.token).to.equal('tok-456');
    expect(authController._authFlowKey).to.equal('flowkey2');
  });

  it('[LBH3] a failed redemption ends in ERROR, never a token-less AUTHORIZED', async () => {
    setPage('http://localhost/app?prYvpoll=https%3A%2F%2Freg.test.local%2Faccess%2Fflowkey3');
    stub(() => { throw new Error('shared-secret-unavailable'); });
    const authController = { serviceInfo: { access: 'https://reg.test.local/access/' } };
    await LoginButton.prototype.finishAuthProcessAfterRedirection.call({}, authController);

    expect(authController.state.status).to.equal('ERROR');
    expect(authController.state.message).to.equal('Credential hand-off failed');
    expect(authController.state.apiEndpoint).to.equal(undefined);
  });
});
