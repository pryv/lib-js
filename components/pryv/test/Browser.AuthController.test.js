/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, testData, Browser */
/* eslint-disable no-unused-expressions */

const utils = require('../src/utils.js');
const Service = require('../src/Service');
const AuthController = require('../src/Auth/AuthController.js');

describe('Browser.LoginButton', function () {
  this.timeout(5000);

  let auth;
  let removeZombie = false;
  before(async function () {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./?serviceInfoUrl=https://zouzou.com/service/info');
    global.document = browser.document;
    global.window = browser.window;
    global.location = browser.location;
    global.navigator = { userAgent: 'Safari' };
  });

  after(async function () {
    if (!removeZombie) return; // in browser
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

    expect('https://my.Url.com/?serviceInfoUrl=zzz').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?serviceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/#prYvstatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
  });
});
