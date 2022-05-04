/* global chai, describe, it, before, after, Browser, Pryv */
/* eslint-disable no-unused-expressions */

const should = chai.should();
const expect = chai.expect;

const testData = require('./test-data.js');

function genSettings () {
  function defaultStateChange (state) {
    console.log('Test unimplemented on state change', state);
  }
  return {
    authRequest: {
      requestingAppId: 'lib-js-test',
      requestedPermissions: [{ streamId: '*', level: 'read' }]
    },
    onStateChange: defaultStateChange
  };
}

describe('Browser', function () {
  this.timeout(5000);

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  let removeZombie = false;

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./?pryvServiceInfoUrl=https://zouzou.com/service/info');
    global.document = browser.document;
    global.window = browser.window;
    global.location = browser.location;
    global.navigator = { userAgent: 'Safari' };
  });

  after(async () => {
    if (!removeZombie) return; // in browser
    delete global.document;
    delete global.window;
    delete global.location;
  });

  it('setupAuth()', async () => {
    const settings = genSettings();
    let AuthLoaded = false;
    settings.onStateChange = function (state) {
      should.exist(state.id);
      if (state.id === Pryv.Auth.AuthStates.LOADING) {
        AuthLoaded = true;
      }
      if (state.id === Pryv.Auth.AuthStates.INITIALIZED) {
        expect(AuthLoaded).to.true;
      }
    };

    try {
      const service = await Pryv.Auth.setupAuth(settings, testData.serviceInfoUrl);
      const serviceInfo = service.infoSync();
      should.exist(serviceInfo.access);
      should.exist(serviceInfo.serial);
    } catch (error) {
      console.log(error);
      should.not.exist(error);
    }
  });

  it('serviceInfoFromUrl()', async () => {
    expect('https://zouzou.com/service/info').to.equal(Pryv.Browser.serviceInfoFromUrl());
  });
});
