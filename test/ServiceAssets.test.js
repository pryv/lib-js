const expect = chai.expect;

const testData = require('./test-data.js');

describe('ServiceAssets', function () {
  let removeZombie = false;
  
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
    if (! removeZombie) return; // in browser
    delete global.document;
    delete global.window; 
    delete global.location; 
  });

  it('relativeURL()', async () => {
   
    const pryvService = Pryv.Service.createWithDefinition(testData.defaults.serviceInfoSettings);
    const assets = await pryvService.assets();
   
    expect(assets.relativeURL('./toto')).to.eql('https://pryv.github.io:/assets-pryv.me/toto');
   

  });

  it('setAllDefaults()', async () => {
    const pryvService = Pryv.Service.createWithDefinition(testData.defaults.serviceInfoSettings);
    const assets = await pryvService.assets();
    await assets.setAllDefaults();

  });

  it('Load all external elements', async () => {
    const pryvService = Pryv.Service.createWithDefinition(testData.defaults.serviceInfoSettings);
    const assets = await pryvService.assets();
    await assets.loginButtonLoadCSS();
    await assets.loginButtonGetHTML();
    await assets.loginButtonGetMessages();
  });

});


