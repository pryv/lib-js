/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const superagent = require('superagent');

const username = 'jslibtest6';

// default testing on Pryv.me
let serviceInfoUrl = 'https://reg.pryv.me/service/info';
let coreDnsLessUrl = null;

if (process.env.TEST_PRYVLIB_SERVICEINFO_URL != null) {
  serviceInfoUrl = process.env.TEST_PRYVLIB_SERVICEINFO_URL;
}

if (process.env.TEST_PRYVLIB_DNSLESS_URL != null) {
  coreDnsLessUrl = process.env.TEST_PRYVLIB_DNSLESS_URL;
  serviceInfoUrl = coreDnsLessUrl + 'reg/service/info';
}

/**
 * Data used for tests
 */
const testData = module.exports = {
  username: username,
  password: username,
  serviceInfoUrl: serviceInfoUrl,
  token: null,
  serviceInfo: null,
  apiEndpoint: null,
  apiEndpointWithToken: null,
  prepare
};

async function prepare () {
  if (testData.token != null) return testData;
  console.log('Preparing test Data..');

  // fetch serviceInfo
  const serviceInfo = (await superagent.get(serviceInfoUrl)).body;
  if (serviceInfo.api == null) throw new Error('Invalid service Info ' + JSON.stringify(serviceInfo));
  console.log('Testing on ' + serviceInfo.name + ' > register: ' + serviceInfo.register);
  await getHost(serviceInfo);
  if (!await testUserExists(serviceInfo, username)) { // create user
    const host = await getHost(serviceInfo);

    try {
      // create user
      await superagent.post(host + 'users')
        .send({
          appId: 'js-lib-test',
          username: username,
          password: username,
          email: username + '@pryv.io',
          invitationtoken: 'enjoy',
          languageCode: 'en',
          referer: 'test-suite'
        });
    } catch (e) {
      console.log('Failed creating user ', e);
      throw new Error('Failed creating user ' + host + 'users');
    }
  }
  const apiEndpoint = serviceInfo.api.replace('{username}', username);

  // login user
  const headers = {};
  if (typeof window === 'undefined') { headers.Origin = 'https://l.rec.la'; } // node only
  const loginRes = await superagent.post(apiEndpoint + 'auth/login')
    .set(headers)
    .send({ username: username, password: username, appId: 'js-lib-test' });

  // create data stream
  try {
    await superagent.post(apiEndpoint + 'streams').set('authorization', loginRes.body.token).send({
      id: 'data',
      name: 'Data'
    });
  } catch (e) {
  }
  if ((loginRes.body == null) || (loginRes.body.token == null)) throw Error('Failed login process during testData prepare' + loginRes.text);
  testData.serviceInfo = serviceInfo;
  testData.token = loginRes.body.token;

  const regexAPIandToken = /(.+):\/\/(.+)/gm;
  const res = regexAPIandToken.exec(apiEndpoint);
  testData.apiEndpointWithToken = res[1] + '://' + testData.token + '@' + res[2];
  testData.apiEndpoint = apiEndpoint;
}

async function testUserExists (serviceInfo, username) {
  if (coreDnsLessUrl != null) {
    const coreApi = serviceInfo.api.replace('{username}', username);
    try {
      await superagent.get(coreApi + 'service/info');
    } catch (e) {
      if (e.response?.body?.error?.id === 'unknown-resource') {
        return false;
      }
      throw new Error('Error testUserExists fetching: ' + coreApi + '/service/info');
    }
    return true;
  }
  // test if user exists
  try {
    const userExists = (await superagent.get(serviceInfo.register + username + '/check_username')).body;
    if (typeof userExists.reserved === 'undefined') throw Error('Invalid user exists ' + JSON.stringify(userExists));
    return userExists.reserved;
  } catch (e) {
    throw Error('Failed check user ' + serviceInfo.register + username + '/check_username', e);
  }
}

async function getHost (serviceInfo) {
  if (coreDnsLessUrl != null) {
    return coreDnsLessUrl;
  }
  // get available hosting
  const hostings = (await superagent.get(serviceInfo.register + 'hostings').set('accept', 'json')).body;
  let hostingCandidate = null;
  findOneHostingKey(hostings, 'N');
  function findOneHostingKey (o, parentKey) {
    for (const key of Object.keys(o)) {
      if (parentKey === 'hostings') {
        const hosting = o[key];
        if (hosting.available) {
          hostingCandidate = hosting;
        }
        return;
      }
      if (typeof o[key] !== 'string') {
        findOneHostingKey(o[key], key);
      }
    }
  }
  if (hostingCandidate == null) throw Error('Cannot find hosting in: ' + JSON.stringify(hostings));
  return hostingCandidate.availableCore;
}
