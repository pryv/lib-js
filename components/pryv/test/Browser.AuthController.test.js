/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, testData, JSDOM */

const utils = require('../src/utils.js');
const Service = require('../src/Service');
const AuthController = require('../src/Auth/AuthController.js');

describe('Browser.LoginButton', function () {
  this.timeout(15000);

  let auth;
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
    const service = new Service(testData.serviceInfoUrl);
    await service.info();
    auth = new AuthController({
      authRequest: {
        requestingAppId: 'lib-js-test',
        requestedPermissions: []
      }
    }, service);
    await auth.init();
  });

  it('getReturnURL()', async function () {
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

  it('browserIsMobileOrTablet()', async function () {
    expect(utils.browserIsMobileOrTablet({ userAgent: 'android' })).to.be.true;
    expect(utils.browserIsMobileOrTablet({ userAgent: 'Safari' })).to.be.false;
  });

  it('cleanURLFromPrYvParams()', async function () {
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
});
