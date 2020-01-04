
const should = chai.should();

const testData = require('./test-data.js');

function genSettings() {
  return {
    serviceInfoUrl: testData.defaults.serviceInfoUrl,
    accessRequest: {
      requestingAppId: 'lib-js-test',
      requestedPermissions: [{ streamId: '*', level: 'read' }]
    },
    on: function (key, data) { return true; }
  };
}

describe('Auth', function () {
  it('init()', (done) => {
    const auth = new Pryv.Auth(genSettings());
    auth.init().then((res) => {
      console.log(res);
      done();
    }).catch((error) =>  {
      should.not.exist(error);
    });
  });

  it('init() Called Twice should throw an error', async  () => {
    const auth = new Pryv.Auth(genSettings());
    await auth.init();

    let error;
    try { 
      await auth.init();
    } catch (e) {
      error = e;
    }
    should.exist(error);
  });

  it ('unit _postAccess() ', async () => { 
    const auth = new Pryv.Auth(genSettings());
    await auth.init();

    const res = await auth._postAccess();
    should.exist(res);
    should.exist(res.status);
  });
});


