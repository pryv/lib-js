/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

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
  username,
  password: username,
  serviceInfoUrl,
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
  const serviceInfo = await fetchGet(serviceInfoUrl);
  if (serviceInfo.api == null) throw new Error('Invalid service Info ' + JSON.stringify(serviceInfo));
  console.log('Testing on ' + serviceInfo.name + ' > register: ' + serviceInfo.register);
  await getHost(serviceInfo);
  if (!await testUserExists(serviceInfo, username)) { // create user
    const host = await getHost(serviceInfo);

    try {
      // create user
      await fetchPost(host + 'users', {
        appId: 'js-lib-test',
        username,
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
  if (typeof window === 'undefined') { headers.Origin = 'https://l.backloop.dev'; } // node only
  const loginRes = await fetchPost(apiEndpoint + 'auth/login', {
    username,
    password: username,
    appId: 'js-lib-test'
  }, headers);

  // create data stream
  try {
    await fetchPost(apiEndpoint + 'streams', {
      id: 'data',
      name: 'Data'
    }, { authorization: loginRes.token });
  } catch (e) {
  }
  if (loginRes?.token == null) throw Error('Failed login process during testData prepare' + JSON.stringify(loginRes));
  testData.serviceInfo = serviceInfo;
  testData.token = loginRes.token;

  const regexAPIandToken = /(.+):\/\/(.+)/gm;
  const res = regexAPIandToken.exec(apiEndpoint);
  testData.apiEndpointWithToken = res[1] + '://' + testData.token + '@' + res[2];
  testData.apiEndpoint = apiEndpoint;
}

async function testUserExists (serviceInfo, username) {
  if (coreDnsLessUrl != null) {
    const coreApi = serviceInfo.api.replace('{username}', username);
    try {
      await fetchGet(coreApi + 'service/info');
    } catch (e) {
      if (e.body?.error?.id === 'unknown-resource') {
        return false;
      }
      throw new Error('Error testUserExists fetching: ' + coreApi + '/service/info');
    }
    return true;
  }
  // test if user exists
  try {
    const userExists = await fetchGet(serviceInfo.register + username + '/check_username');
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
  const hostings = await fetchGet(serviceInfo.register + 'hostings');
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

// -- fetch helpers --

async function fetchGet (url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error('GET ' + url + ' failed: ' + response.status);
    error.body = body;
    throw error;
  }
  return body;
}

async function fetchPost (url, data, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data)
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error('POST ' + url + ' failed: ' + response.status);
    error.body = body;
    throw error;
  }
  return body;
}
