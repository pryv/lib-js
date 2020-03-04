/**
 * Data used for tests
 */
const defaults = {
  user: 'jslibtest.pryv.me',
  password: 'jslibtest',
  token: 'ck60yn9yv00011hd3vu1ocpi7',
  serviceInfoUrl: 'https://reg.pryv.me/service/info',
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




module.exports = {
  defaults: defaults,
  pryvApiEndPoints : [
    'https://' + defaults.token + '@' + defaults.user,
    'https://' + defaults.user 
  ]
}