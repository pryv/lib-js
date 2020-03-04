/**
 * Entry Point for WebPack to build test series to be run in browser
 */
mocha.setup({ ignoreLeaks: true });

require('./utils.test.js');
require('./Connection.test.js');
require('./Service.test.js');
require('./ServiceAssets.test.js');
require('./Auth.test.js');
require('./Auth.Controller.test.js');