const expect = chai.expect;
const Browser = require('Zombie');

const testData = require('./test-data.js');

describe('ServiceAssets', function () {
  let removeZombie = false;

  before(async () => {
    console.log('A');
    if (typeof document !== 'undefined') return; // in browser
    console.log('B');
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

  it('realativeURL()', async () => {
    const pryvService = new Pryv.Service(testData.defaults.serviceInfoSettings);
    const assets = await pryvService.assets();
   
    expect(assets.relativeURL('./toto')).to.eql('https://pryv.github.io:/assets-pryv.me/toto');

  });

});


