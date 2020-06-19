const superagent = require('superagent');

const username = 'jslibtest4';
const serviceInfoUrl = 'https://reg.pryv.me/service/info';

//const username = 'jslibtest';
/**
 * Data used for tests
 */
const testData = {
  username: username,
  password: username,
  serviceInfoUrl: serviceInfoUrl,
  token: null,
  serviceInfo: null,
  apiEndPoint: null,
  apiEndPointWithToken: null
}


async function prepare() {
  if (testData.token) return testData;
  console.log('Preparing test Data..');
  // fetch serviceInfo

  const serviceInfo = (await superagent.get(serviceInfoUrl)).body;
  if (!serviceInfo.api) throw 'Invalid service Info ' + JSON.stringify(serviceInfo);
  // test if user exists
  const userExists = (await superagent.get(serviceInfo.register + username + '/check_username')).body;
  if (typeof userExists.reserved === 'undefined') throw 'Invalid user exists ' + JSON.stringify(userExists);

  let hostingCandidate = null;
  if (!userExists.reserved) { // create user
    // get available hosting
    const hostings = (await superagent.get(serviceInfo.register + 'hostings').set('accept', 'json')).body;
    function findOneHostingKey(o, parentKey) {      
      for (const key of Object.keys(o)) {
        if (parentKey === 'hostings') {
          hostingCandidate = key;
          return key;
        }
        if (typeof o[key] !== 'string')
             findOneHostingKey(o[key], key);
      }
    };
    findOneHostingKey(hostings, 'N');
    if (!hostingCandidate) throw 'Cannot find hosting in: ' + JSON.stringify(hostings);
    const hosting = hostingCandidate;

    // create user
    await superagent.post(serviceInfo.register + 'user')
      .send({
        appid: 'js-lib-test',
        hosting: hosting,
        username: username,
        password: username,
        email: username + '@pryv.io',
        invitationtoken: 'enjoy',
        languageCode: 'en',
        referer: 'test-suite'
      });
  }
  const apiEndPoint = serviceInfo.api.replace('{username}', username);
  // login user
  const loginRes = await superagent.post(apiEndPoint + 'auth/login')
    .set('Origin', 'https://l.rec.la')
    .send({ username: username, password: username, appId: 'js-lib-test' });

  // create data stream
  try {
    const streamId = await superagent.post(apiEndPoint + 'streams').set('authorization', loginRes.body.token).send(
      {
        id: 'data',
        name: 'Data'
      }
    )
  } catch (e) {
  }
  if (! loginRes.body || ! loginRes.body.token) throw 'Failed login process during testData prepare' + loginRes.text;
  testData.serviceInfo = serviceInfo;
  testData.token = loginRes.body.token;

  const regexAPIandToken = /(.+):\/\/(.+)/gm;
  const res = regexAPIandToken.exec(apiEndPoint);
  testData.apiEndPointWithToken = res[1] + '://' + testData.token + '@' + res[2];
  testData.apiEndPoint = apiEndPoint;
}

testData.prepare = prepare;


module.exports = testData;