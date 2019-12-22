/**
 * Data used for tests
 */
const defaults = {
  user: 'marianne.pryv.me',
  token: 'ck48a23l000hn1g40xjjg1y0i'
}

module.exports = {
  defaults: defaults,
  pryvApiEndPoints : [
    'https://' + defaults.token + '@' + defaults.user
  ]
}