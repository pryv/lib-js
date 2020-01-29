
const should = chai.should();
const expect = chai.expect;

const testData = require('./test-data.js');

function genSettings() {
  function defaultStateChange(state) { 
    console.log('Test unimplemented on state change', state); 
  }
  return {
    serviceInfoUrl: testData.defaults.serviceInfoUrl,
    authRequest: {
      requestingAppId: 'lib-js-test',
      requestedPermissions: [{ streamId: '*', level: 'read' }],
    },
    onStateChange: defaultStateChange
  };
}

describe('Auth', function () {
  this.timeout(5000); 
  it('setup()', (done) => {
    global.document = false;
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

    Pryv.Auth.setup(settings).then((res) => {
      should.exist(res.access);
      should.exist(res.serial);
    }).catch((error) =>  {
      console.log(error);
      should.not.exist(error);
      done();
    });
  });

});


