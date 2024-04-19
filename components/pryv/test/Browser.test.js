/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, Browser, pryv, testData */
/* eslint-disable no-unused-expressions */

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
  this.timeout(15000);

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
  });

  let removeZombie = false;

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./?pryvServiceInfoUrl=https://zou.zou/service/info');
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
      if (state.id === pryv.Auth.AuthStates.LOADING) {
        AuthLoaded = true;
      }
      if (state.id === pryv.Auth.AuthStates.INITIALIZED) {
        expect(AuthLoaded).to.true;
      }
    };

    try {
      const service = await pryv.Auth.setupAuth(settings, testData.serviceInfoUrl);
      const serviceInfo = service.infoSync();
      expect(serviceInfo.access).to.exist;
      expect(serviceInfo.serial).to.exist;
    } catch (error) {
      console.log(error);
      expect(error).to.not.exist;
    }
  });

  it('serviceInfoFromUrl()', async () => {
    expect('https://zou.zou/service/info').to.equal(pryv.Browser.serviceInfoFromUrl());
  });
});
