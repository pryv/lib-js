/**
 * Data used for tests
 */
const defaults = {
  user: 'perki.pryv.me', //'jslibtest.pryv.me',
  token: 'ck66b85pi004e1n403i6p97u4', //'ck60yn9yv00011hd3vu1ocpi7',
  serviceInfoUrl: 'https://reg.pryv.me/service/info'
}




module.exports = {
  defaults: defaults,
  pryvApiEndPoints : [
    'https://' + defaults.token + '@' + defaults.user,
    'https://' + defaults.user 
  ]
}