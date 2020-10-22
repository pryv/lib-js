exports.authSettingsExample = {
  authSettings: {
    spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
    // onStateChange: function pryvAuthStateChange(state) {
    //   console.log(state,'state', this,'thissssssssssssssssss');
    // }, // event Listener for Authentication steps
    authRequest: { // See: https://api.pryv.com/reference/#auth-request
      requestingAppId: 'lib-js-test',
      languageCode: 'fr', // optional (default english)
      returnURL: 'auto#',
      requestedPermissions: [
        {
          streamId: 'test',
          defaultName: 'test',
          level: 'manage'
        }
      ],
      clientData: {
        'app-web-auth:description': {
          'type': 'note/txt',
          'content': 'This is a consent message.'
        }
      },
      // referer: 'my test with lib-js', // optional string to track registration source
    }
  },
  serviceInfoUrl: ''//'service-info.json';//https://api.pryv.com/lib-js/demos
}