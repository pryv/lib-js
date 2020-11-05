const superagent = require('superagent');

const username = 'jslibtest5';
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
//const serviceInfoUrl = 'https://l.rec.la:4443/reg/service/info';

/**
 * Data used for tests
 */
const testData = {
  username: username,
  password: username,
  serviceInfoUrl: serviceInfoUrl,
  token: null,
  serviceInfo: null,
  apiEndpoint: null,
  apiEndpointWithToken: null
}


async function prepare() {
  if (testData.token != null) return testData;
  console.log('Preparing test Data..');
  // fetch serviceInfo

  const serviceInfo = (await superagent.get(serviceInfoUrl)).body;
  if (serviceInfo.api == null) throw 'Invalid service Info ' + JSON.stringify(serviceInfo);
  // test if user exists
  const userExists = (await superagent.get(serviceInfo.register + username + '/check_username')).body;
  if (typeof userExists.reserved === 'undefined') throw 'Invalid user exists ' + JSON.stringify(userExists);

  let hostingCandidate = null;
  if (! userExists.reserved) { // create user
    // get available hosting
    const hostings = (await superagent.get(serviceInfo.register + 'hostings').set('accept', 'json')).body;
    findOneHostingKey(hostings, 'N');
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
    if (hostingCandidate == null) throw 'Cannot find hosting in: ' + JSON.stringify(hostings);
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
  const apiEndpoint = serviceInfo.api.replace('{username}', username);
  // login user
  const loginRes = await superagent.post(apiEndpoint + 'auth/login')
    .set('Origin', 'https://l.rec.la')
    .send({ username: username, password: username, appId: 'js-lib-test' });

  // create data stream
  try {
    const streamRes = await superagent.post(apiEndpoint + 'streams').set('authorization', loginRes.body.token).send(
      {
        id: 'data',
        name: 'Data'
      }
    )
  } catch (e) {
  }
  if ((loginRes.body == null) || (loginRes.body.token == null)) throw 'Failed login process during testData prepare' + loginRes.text;
  testData.serviceInfo = serviceInfo;
  testData.token = loginRes.body.token;

  const regexAPIandToken = /(.+):\/\/(.+)/gm;
  const res = regexAPIandToken.exec(apiEndpoint);
  testData.apiEndpointWithToken = res[1] + '://' + testData.token + '@' + res[2];
  testData.apiEndpoint = apiEndpoint;
}

testData.prepare = prepare;


module.exports = testData;