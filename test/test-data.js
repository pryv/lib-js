/**
 * Data used for tests
 */
const defaults = {
  user: 'jslibtest.pryv.me',
  token: 'ck60yn9yv00011hd3vu1ocpi7',
  serviceInfoUrl: 'https://reg.pryv.me/service/info'
}




module.exports = {
  defaults: defaults,
  pryvApiEndPoints : [
    'https://' + defaults.token + '@' + defaults.user,
    'https://' + defaults.user 
  ]
}