const superagent = require('superagent');

const username = 'jslibtest';
const serviceInfoUrl = 'https://reg.pryv.me/service/info';

//const username = 'jslibtest';
/**
 * Data used for tests
 */
const defaults = {
  username: username,
  password: username,
  token: 'ck60yn9yv00011hd3vu1ocpi7',
  serviceInfoUrl: serviceInfoUrl,
  serviceInfoSettings: {
    "register": "https://reg.pryv.me",
    "access": "https://access.pryv.me/access",
    "api": "https://{username}.pryv.me/",
    "name": "Pryv Lab",
    "home": "https://www.pryv.com",
    "support": "https://pryv.com/helpdesk",
    "terms": "https://pryv.com/pryv-lab-terms-of-use/",
    "eventTypes": "https://api.pryv.com/event-types/flat.json",
    "assets": {
      "definitions": "https://pryv.github.io/assets-pryv.me/index.json"
    }
  }
}

const pryvApiEndPoints = [
  'https://' + defaults.token + '@' + defaults.user,
  'https://' + defaults.user
];


let testData = null;

async function prepare() {
  if (testData) return testData;
  console.log('Preparing test Data..');
  // fetch serviceInfo
  const serviceInfo = (await superagent.get(serviceInfoUrl)).body;
  if (!serviceInfo.api) throw 'Invalid service Info ' + JSON.stringify(serviceInfo);
  // test if user exists
  const userExists = (await superagent.get(serviceInfo.register + username + '/check_username')).body;
  if (typeof userExists.reserved === 'undefined') throw 'Invalid user exists ' + JSON.stringify(userExists);
  if (!userExists.reserved) { // create user
    // get available hosting
    const hostings = (await superagent.get(serviceInfo.register + '/hostings')).body;
    let hostingCandidate = null;
    function findOneHostingKey(o, nextOneIsHosting) {
      hostingCandidate = Object.keys(o)[0];
      if (nextOneIsHosting || hostingCandidate === null) return;
      findOneHostingKey(o[hosting], hostingCandidate === 'hostings');
    } (hostings, false);
    if (!hostingCandidate) throw 'Cannot find hosting in: ' + JSON.stringify(hostings);
    const hosting = hostingCandidate;

    // create user
    await superagent.post(serviceInfo.register + '/user')
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
  if (! loginRes.body || ! loginRes.body.token) throw 'Failed login process during testData prepare' + loginRes.text;
  defaults.serviceInfoSettings = serviceInfo;
  defaults.token = loginRes.body.token;

  const regexAPIandToken = /(.+):\/\/(.+)/gm;
  const res = regexAPIandToken.exec(apiEndPoint);
  pryvApiEndPoints[0] = res[1] + '://' + defaults.token + '@' + res[2];
  pryvApiEndPoints[1] = apiEndPoint;
}




module.exports = {
  defaults: defaults,
  pryvApiEndPoints : pryvApiEndPoints,
  prepare: prepare
}