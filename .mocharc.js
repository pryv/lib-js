const path = require('path');

module.exports = {
  exit: true,
  slow: 75,
  timeout: 3000,
  ui: 'bdd',
  diff: true,
  reporter: 'spec',
  require: path.join(__dirname, 'test/load-helpers.js'),
  spec: 'test/**/*.test.js'
};
