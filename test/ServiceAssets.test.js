/* global chai, describe, it, before, after, Browser, Pryv */

const expect = chai.expect;

const testData = require('./test-data.js');

describe('ServiceAssets', function () {
  let removeZombie = false;

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./');
    global.document = browser.document;
    global.window = browser.window;
    global.location = browser.location;
  });

  after(async () => {
    if (!removeZombie) return; // in browser
    delete global.document;
    delete global.window;
    delete global.location;
  });

  it('relativeURL()', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    expect(assets.relativeURL('./toto')).to.eql(testData.serviceInfo.assets.definitions.replace('index.json', 'toto'));
  });

  it('setAllDefaults()', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    await assets.setAllDefaults();
  });

  it('Load all external elements', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();

    await assets.loginButtonLoadCSS();
    await assets.loginButtonGetHTML();
    await assets.loginButtonGetMessages();
  });

  it('.get() returns all assets', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const allAssets = await assets.get();
    expect(allAssets.favicon.default.url).to.eql('favicon.ico');
  });

  it('.get(keyPath) ', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const faviconUrl = await assets.get('favicon:default:url');
    expect(faviconUrl).to.eql('favicon.ico');
  });

  it('.getUrl(keyPath) ', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const faviconUrl = await assets.getUrl('favicon:default:url');
    expect(faviconUrl).to.eql(testData.serviceInfo.assets.definitions.replace('index.json', 'favicon.ico'));
  });
});
