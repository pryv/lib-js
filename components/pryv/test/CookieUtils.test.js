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
});
