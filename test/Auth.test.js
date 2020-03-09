
const should = chai.should();
const expect = chai.expect;

const testData = require('./test-data.js');

function genSettings() {
  function defaultStateChange(state) { 
    console.log('Test unimplemented on state change', state); 
  }
  return {
    authRequest: {
      requestingAppId: 'lib-js-test',
      requestedPermissions: [{ streamId: '*', level: 'read' }],
    },
    onStateChange: defaultStateChange
  };
}

describe('Auth', function () {
  this.timeout(5000); 

  let removeZombie = false;

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./?service-info=https://zouzou.com/service/info');
    global.document = browser.document;
    global.window = browser.window;
    global.location = browser.location;
    global.navigator = {userAgent: 'Safari'};
  });

  after(async () => {
    if (!removeZombie) return; // in browser
    delete global.document;
    delete global.window;
    delete global.location;
  });

  it('setup()', (done) => {
    const settings = genSettings();
    
    let AuthLoaded = false;
    let ServiceInfoLoaded = false;
    settings.onStateChange = function (state) {
      should.exist(state.id);
      if (state.id == Pryv.Auth.States.LOADING) {
        AuthLoaded = true;
      }
      if (state.id == Pryv.Auth.States.INITIALIZED) {
        expect(AuthLoaded).to.true;
        done();
      }
    }

    Pryv.Auth.setup(settings, testData.defaults.serviceInfoUrl).then((service) => {
      const serviceInfo = service.infoSync();
      should.exist(serviceInfo.access);
      should.exist(serviceInfo.serial);
    }).catch((error) =>  {
      console.log(error);
      should.not.exist(error);
      done();
    });
  });


  it ('serviceInfoFromUrl()', async () => {
    expect('https://zouzou.com/service/info').to.equal(Pryv.Auth.serviceInfoFromUrl());
  });

});


