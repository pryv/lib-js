/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, JSDOM */

const CookieUtils = require('../src/Browser/CookieUtils');

describe('[COKX] CookieUtils', function () {
  let cleanupDom = false;

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    cleanupDom = true;
    const dom = new JSDOM('<!DOCTYPE html>', {
      url: 'http://localhost/'
    });
    global.document = dom.window.document;
    global.window = dom.window;
  });

  after(async () => {
    if (!cleanupDom) return;
    delete global.document;
    delete global.window;
  });

  it('[COKA] set() and get() cookie', async function () {
    const testKey = 'test-cookie-key';
    const testValue = { foo: 'bar', num: 123 };
    CookieUtils.set(testKey, testValue);
    const retrieved = CookieUtils.get(testKey);
    expect(retrieved).to.deep.equal(testValue);
  });

  it('[COKB] get() returns undefined for non-existent cookie', async function () {
    const result = CookieUtils.get('non-existent-cookie-key');
    expect(result).to.be.undefined;
  });

  it('[COKC] del() removes cookie', async function () {
    const testKey = 'cookie-to-delete';
    CookieUtils.set(testKey, { data: 'test' });
    expect(CookieUtils.get(testKey)).to.exist;
    CookieUtils.del(testKey);
    // After deletion, the cookie is set to { deleted: true } with expiration in the past
    // The cookie may still exist but with deleted flag
    const afterDel = CookieUtils.get(testKey);
    if (afterDel) {
      expect(afterDel.deleted).to.be.true;
    }
  });

  it('[COKD] set() with custom expiration', async function () {
    const testKey = 'cookie-with-expiry';
    const testValue = 'expires-soon';
    CookieUtils.set(testKey, testValue, 30);
    const retrieved = CookieUtils.get(testKey);
    expect(retrieved).to.equal(testValue);
  });

  it('[COKE] handles special characters in values', async function () {
    const testKey = 'special-chars';
    const testValue = { text: 'hello=world&foo=bar', unicode: '日本語' };
    CookieUtils.set(testKey, testValue);
    const retrieved = CookieUtils.get(testKey);
    expect(retrieved).to.deep.equal(testValue);
  });

  // Pages on several paths of one host, sharing one cookie jar (jsdom only:
  // the browser test page cannot open other paths).
  describe('[COKY] paths, and copies left by older versions', function () {
    const KEY = 'pryv-libjs-path-test';
    const legacy = (value, attrs) => KEY + '=' + encodeURIComponent(JSON.stringify(value)) + attrs;
    let saved;
    let jar;

    before(function () {
      if (typeof JSDOM === 'undefined') this.skip();
      saved = { document: global.document, window: global.window };
    });
    beforeEach(() => { jar = null; });
    after(() => {
      if (saved == null) return;
      global.document = saved.document;
      global.window = saved.window;
    });

    /** Open `url` in a page that shares the cookie jar of the previous ones. */
    function openPage (url) {
      const dom = new JSDOM('<!DOCTYPE html>', jar != null ? { url, cookieJar: jar } : { url });
      jar = dom.cookieJar;
      global.document = dom.window.document;
      global.window = dom.window;
    }
    // every live copy for this host, whatever its path (expired ones are dropped)
    const copies = () => jar.getCookiesSync(window.location.href, { allPaths: true }).filter((c) => c.key === KEY);

    it('[COKF] get() reads the site-wide copy when a deeper copy is also sent', function () {
      openPage('http://localhost/patients');
      document.cookie = legacy({ v: 'site' }, ';path=/');
      document.cookie = legacy({ v: 'deep' }, ';path=/patients');
      expect(document.cookie.split(KEY + '=').length).to.equal(3); // both are sent, deeper first
      expect(CookieUtils.get(KEY)).to.deep.equal({ v: 'site' });
    });

    it('[COKG] set() on a deep route leaves one site-wide, host-only copy', function () {
      openPage('http://localhost/patients/42');
      // what versions before 3.17 wrote: Domain cookie for the page's own path
      for (const path of ['/', '/patients', '/patients/', '/patients/42']) {
        document.cookie = legacy({ v: path }, ';domain=.localhost;path=' + path);
      }
      CookieUtils.set(KEY, { v: 'new' });
      const left = copies();
      expect(left.map((c) => c.path)).to.deep.equal(['/']);
      expect(left[0].hostOnly).to.equal(true);
      expect(CookieUtils.get(KEY)).to.deep.equal({ v: 'new' });
    });

    it('[COKH] del() on a deep route removes the site-wide copy (log out from any page)', function () {
      openPage('http://localhost/');
      CookieUtils.set(KEY, { v: 'signed-in' });
      document.cookie = legacy({ v: 'old' }, ';domain=.localhost;path=/');
      openPage('http://localhost/patients/42');
      document.cookie = legacy({ v: 'old-deep' }, ';domain=.localhost;path=/patients');
      CookieUtils.del(KEY);
      expect(CookieUtils.get(KEY)).to.equal(undefined);
      openPage('http://localhost/');
      expect(CookieUtils.get(KEY)).to.equal(undefined);
      expect(copies()).to.deep.equal([]);
    });

    it('[COKI] attributes: host-only, SameSite=Strict, Secure on https, path option', function () {
      openPage('https://app.example.test/x/y');
      CookieUtils.set(KEY, 1);
      let [c] = copies();
      expect([c.path, c.hostOnly, c.secure, c.sameSite]).to.deep.equal(['/', true, true, 'strict']);
      openPage('http://localhost/app/page');
      CookieUtils.set(KEY, 2, 1, { path: '/app/' });
      [c] = copies();
      expect([c.path, c.secure === true]).to.deep.equal(['/app/', false]);
      CookieUtils.del(KEY, { path: '/app/' });
      expect(copies()).to.deep.equal([]);
    });

    it('[COKJ] get() returns undefined for an unreadable value instead of throwing', function () {
      openPage('http://localhost/');
      document.cookie = KEY + '=not-json;path=/';
      expect(CookieUtils.get(KEY)).to.equal(undefined);
    });
  });
});
