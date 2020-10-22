import Pryv from '/dist/pryv.js';
var connection = null;

var authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'lib-js-test',
    languageCode: 'fr', // optional (default english)
    requestedPermissions: [
      {
        streamId: 'test',
        defaultName: 'test',
        level: 'manage'
      }
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt', 'content': 'This is a consent message.'
      }
    },
    // referer: 'my test with lib-js', // optional string to track registration source
  }
};

function pryvAuthStateChange (state) { // called each time the authentication state changed
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    connection = new Pryv.Connection(state.apiEndpoint);
    logToConsole('# Browser succeeded for user ' + connection.apiEndpoint);
  }
  if (state.id === Pryv.Browser.AuthStates.LOGOUT) {
    connection = null;
    logToConsole('# Logout');
  }
}
var serviceInfoUrl = 'service-info.json';//https://api.pryv.com/lib-js/demos
(async function () {
  var service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
})();