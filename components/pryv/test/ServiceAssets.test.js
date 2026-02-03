/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, JSDOM, pryv, testData */

describe('ServiceAssets', function () {
  let cleanupDom = false;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
  });

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    cleanupDom = true;
    const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost/' });
    global.document = dom.window.document;
    global.window = dom.window;
    global.location = dom.window.location;
  });

  after(async () => {
    if (!cleanupDom) return; // in browser
    delete global.document;
    delete global.window;
    delete global.location;
  });

  it('relativeURL()', async () => {
    const pryvService = new pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    expect(assets.relativeURL('./toto')).to.eql(testData.serviceInfo.assets.definitions.replace('index.json', 'toto'));
  });

  it('setAllDefaults()', async () => {
    const pryvService = new pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    await assets.setAllDefaults();
  });

  it('Load all external elements', async () => {
    const pryvService = new pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();

    await assets.loginButtonLoadCSS();
    await assets.loginButtonGetHTML();
    await assets.loginButtonGetMessages();
  });

  it('.get() returns all assets', async () => {
    const pryvService = new pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const allAssets = await assets.get();
    expect(allAssets.favicon.default.url).to.eql('favicon.ico');
  });

  it('.get(keyPath) ', async () => {
    const pryvService = new pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const faviconUrl = await assets.get('favicon:default:url');
    expect(faviconUrl).to.eql('favicon.ico');
  });

  it('.getUrl(keyPath) ', async () => {
    const pryvService = new pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const faviconUrl = await assets.getUrl('favicon:default:url');
    expect(faviconUrl).to.eql(testData.serviceInfo.assets.definitions.replace('index.json', 'favicon.ico'));
  });
});
