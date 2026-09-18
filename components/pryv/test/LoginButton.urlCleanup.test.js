/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, JSDOM */

const LoginButton = require('../src/Browser/LoginButton');
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
