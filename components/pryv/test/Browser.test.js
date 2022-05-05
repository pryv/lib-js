/* global describe, it, before, after, expect, Pryv, testData */
/* eslint-disable no-unused-expressions */

const Browser = require('zombie');

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
      expect(state.id).to.exist;
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
      expect(serviceInfo.access).to.exist;
      expect(serviceInfo.serial).to.exist;
    } catch (error) {
      console.log(error);
      expect(error).to.not.exist;
    }
  });

  it('serviceInfoFromUrl()', async () => {
    expect('https://zouzou.com/service/info').to.equal(Pryv.Browser.serviceInfoFromUrl());
  });
});
