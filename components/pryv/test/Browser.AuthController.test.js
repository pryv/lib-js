/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, testData, JSDOM */

const utils = require('../src/utils.js');
const Service = require('../src/Service');
const AuthController = require('../src/Auth/AuthController.js');
const AuthStates = require('../src/Auth/AuthStates');

describe('[AUTX] Browser.LoginButton', function () {
  this.timeout(15000);

  let auth;
  let service;
  let cleanupDom = false;
  before(async function () {
    if (typeof document !== 'undefined') return; // in browser
    cleanupDom = true;
    const dom = new JSDOM('<!DOCTYPE html>', {
      url: 'http://localhost/?pryvServiceInfoUrl=https://zou.zou/service/info'
    });
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
    global.navigator = { userAgent: 'Safari' };
  });

  after(async function () {
    if (!cleanupDom) return; // in browser
    delete global.document;
    delete global.window;
    delete global.location;
  });
  before(async function () {
    service = new Service(testData.serviceInfoUrl);
    await service.info();
    auth = new AuthController({
      authRequest: {
        requestingAppId: 'lib-js-test',
        requestedPermissions: []
      }
    }, service);
    await auth.init();
  });

  it('[AUTA] getReturnURL()', async function () {
    const myUrl = 'https://mysite.com/bobby';
    let error = null;
    try {
      auth.getReturnURL('auto');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.not.null;

    let fakeNavigator = { userAgent: 'android' };
    expect(auth.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(auth.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(auth.getReturnURL(false, myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(auth.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(auth.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');

    fakeNavigator = { userAgent: 'Safari' };
    expect(auth.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(false);
    expect(auth.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(false);
    expect(auth.getReturnURL(false, myUrl, fakeNavigator)).to.equal(false);
    expect(auth.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(auth.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');
    global.window = { location: { href: myUrl + '?prYvstatus=zouzou' } };
    expect(auth.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
  });

  it('[AUTB] browserIsMobileOrTablet()', async function () {
    expect(utils.browserIsMobileOrTablet({ userAgent: 'android' })).to.be.true;
    expect(utils.browserIsMobileOrTablet({ userAgent: 'Safari' })).to.be.false;
  });

  it('[AUTC] cleanURLFromPrYvParams()', async function () {
    expect('https://my.Url.com/?bobby=2').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/?pryvServiceInfoUrl=zzz').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?pryvServiceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/#prYvstatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
  });

  // Logout state dispatch (https://github.com/pryv/lib-js/issues/13): a listener
  // that synchronously re-enters the setter (the LoginButton's logout confirm
  // re-initializing to INITIALIZED) must not corrupt the state delivered to the
  // other listeners in the same dispatch, and init() must not register the button
  // listener twice (which would fire the logout confirm dialog more than once).
  describe('[ACLO] logout state dispatch (re-entrancy)', function () {
    function makeAuth (onStateChange) {
      return new AuthController({
        authRequest: { requestingAppId: 'test-app', requestedPermissions: [] },
        onStateChange
      }, service);
    }

    it('[ACLO1] the app onStateChange receives SIGNOUT on logout, then INITIALIZED', async function () {
      const seen = [];
      const a = makeAuth((s) => seen.push(s.status));
      await a.init();
      // Mimic LoginButton (registered after the external app listener): on
      // SIGNOUT it confirms + re-initializes, synchronously driving the state
      // to INITIALIZED during the same dispatch.
      a.stateChangeListeners.push((s) => {
        if (s.status === AuthStates.SIGNOUT) a.state = { status: AuthStates.INITIALIZED, serviceInfo: {} };
      });
      a._state = { status: AuthStates.AUTHORIZED };
      seen.length = 0;
      await a.handleClick(); // AUTHORIZED -> SIGNOUT
      expect(seen).to.include(AuthStates.SIGNOUT);
      expect(seen[seen.length - 1]).to.equal(AuthStates.INITIALIZED);
    });

    it('[ACLO2] a listener re-entering the setter must not corrupt the state delivered to later listeners', function () {
      // The setter must hand each listener the state dispatched to IT, not a value
      // an earlier listener mutated mid-dispatch. Worst case: a re-entrant listener
      // registered BEFORE the recorder.
      const a = makeAuth(() => {});
      const seen = [];
      let reentered = false;
      a.stateChangeListeners.push((s) => {
        if (s.status === AuthStates.SIGNOUT && !reentered) {
          reentered = true;
          a.state = { status: AuthStates.INITIALIZED, serviceInfo: {} };
        }
      });
      a.stateChangeListeners.push((s) => seen.push(s.status));
      seen.length = 0;
      a.state = { status: AuthStates.SIGNOUT };
      // The re-entrant INITIALIZED dispatch completes first (inner), then the outer
      // SIGNOUT dispatch resumes to the recorder; the recorder MUST see SIGNOUT.
      expect(seen).to.deep.equal([AuthStates.INITIALIZED, AuthStates.SIGNOUT]);
    });

    it('[ACLO3] init() registers the LoginButton listener only once, so logout confirms exactly once', async function () {
      let confirms = 0;
      const fakeButton = {
        onStateChange: (s) => { if (s.status === AuthStates.SIGNOUT) confirms++; },
        getAuthorizationData: () => null
      };
      const a = new AuthController({
        authRequest: { requestingAppId: 'test-app', requestedPermissions: [] }
      }, service, fakeButton);
      await a.init();
      const nAfterFirst = a.stateChangeListeners.length;
      await a.init(); // the confirmed-logout path re-inits the same controller
      await a.init();
      expect(a.stateChangeListeners.length).to.equal(nAfterFirst); // no compounding
      confirms = 0;
      a.state = { status: AuthStates.SIGNOUT }; // one dispatch -> one confirm
      expect(confirms).to.equal(1);
    });
  });
});
