# JavaScript library for Pryv.io

This JavaScript library is meant to facilitate writing Node.js and browser apps for a Pryv.io platform. It follows the [Pryv.io App Guidelines](https://api.pryv.com/guides/app-guidelines/).

## Contribute

*Prerequisite*: Node 12+

- Setup: `npm run setup`

- Build pryv.js library for browsers: `npm run build`, the result is published in `./dist`

- Build documentation: `npm run doc`, the result is published in `./dist/docs`

  Note: as per v2.1.7 `jsdoc` dev dependency has been removed from package.json .. it should be installed with `npm install jsoc --dev`

- Node Tests: `npm run test`

- Coverage: `npm run cover`, the result is visible in `./coverage`

- Browser tests: **build**, then `npm run webserver` and open [https://l.rec.la:9443/tests/browser-tests.html?pryvServiceInfoUrl=https://zouzou.com/service/info](https://l.rec.la:9443/tests/browser-tests.html?pryvServiceInfoUrl=https://zouzou.com/service/info)

- Update on CDN: After running **setup** and **build** scripts, run `npm run gh-pages ${COMMIT_MESSAGE}`. If this fails, run `npm run clear` to rebuild a fresh `dist/` folder

## Usage

### Table of Contents

+ [Import](#import)
  - [Browser](#browser)
  - [Node.js](#nodejs)
+ [Obtaining a Pryv.Connection](#obtaining-a-pryvconnection)
  - [Using an API endpoint](#using-an-api-endpoint)
  - [Using a Username & Token (knowing the service information URL)](#using-a-username--token-knowing-the-service-information-url)
  - [Within a WebPage with a login button](#within-a-webpage-with-a-login-button)
  - [Fetch access info](#fetch-access-info)
  - [Using Service.login() *(trusted apps only)*](#using-servicelogin-trusted-apps-only)
  - [Performing the authentication request with your own UI](#customize-auth-process)
+ [API calls](#api-calls)
+ [Advanced usage of API calls with optional individual result and progress callbacks](#advanced-usage-of-api-calls-with-optional-individual-result-and-progress-callbacks)
+ [Get Events Streamed](#get-events-streamed)
  - [Example](#example)
  - [result](#result)
+ [Events with Attachments](#events-with-attachments)
  - [Node.js](#nodejs-1)
  - [Browser](#browser-1)
+ [High Frequency Events](#high-frequency-events)
+ [Service Information and assets](#service-information-and-assets)
  - [Pryv.Service](#pryvservice)
    * [Initizalization with a service info URL](#initizalization-with-a-service-info-url)
    * [Usage of Pryv.Service.](#usage-of-pryvservice)
+ [Pryv.Browser & Visual assets](#pryvbrowser--visual-assets)
  - [Pryv.Browser - retrieve serviceInfo from query URL](#pryvbrowser---retrieve-serviceinfo-from-query-url)
  - [Visual assets](#visual-assets)
+ [Customize Auth process](#customize-auth-process)
  - [Using a custom login button](using-a-custom-login-button)
  - [Redirect user to the authentication page](#redirect-user-to-the-authentication-page)
+ [Launch web demos locally](#launch-web-demos-locally)

### Import

#### Browser

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
```

#### Others distributions for browsers & extensions:

- ES6: `https://api.pryv.com/lib-js/pryv-es6.js`
- Bundle: (Socket.io + Monitor + Lib-js) `https://api.pryv.com/lib-js/pryv-socket.io-monitor.js`.
  This library can be extended with two packages:
  - Socket.io extension: [https://github.com/pryv/lib-js-socket.io](https://github.com/pryv/lib-js-socket.io)
  - Monitor extension: [https://github.com/pryv/lib-js-monitor](https://github.com/pryv/lib-js-monitor)

#### Example on code pen:

- Save notes and measure simple form: [Example on codepen.io](https://codepen.io/pryv/pen/ExVYemE)

#### Node.js

Install with:  `npm install pryv --save `

```javascript
const Pryv = require('pryv');
```

### Obtaining a Pryv.Connection

A connection is an authenticated link to a Pryv.io account.

#### Using an API endpoint

The format of the API endpoint can be found in your platform's [service information](https://api.pryv.com/reference/#service-info) under the `api` property. The most frequent one has the following format: `https://{token}@{api-endpoint}`

```javascript
const apiEndpoint = 'https://ck6bwmcar00041ep87c8ujf90@drtom.pryv.me';
const connection = new Pryv.Connection(apiEndpoint);
```

#### Using a Username & Token (knowing the service information URL)

```javascript
const service = new Pryv.Service('https://reg.pryv.me/service/info');
const apiEndpoint = await service.apiEndpointFor(username, token);
const connection = new Pryv.Connection(apiEndpoint);
```

#### Within a WebPage with a login button

The following code is an implementation of the [Pryv.io Authentication process](https://api.pryv.com/reference/#authenticate-your-app).

```html
<!doctype html>
<html>
<head>
  <title>Pryv - Javascript Lib</title>
  <script src="https://api.pryv.com/lib-js/pryv.js"></script>
</head>
<body>
  <span id="pryv-button"></span>
  <script>
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

    function pryvAuthStateChange(state) { // called each time the authentication state changed
      console.log('##pryvAuthStateChange', state);
      if (state.id === Pryv.Auth.AuthStates.AUTHORIZED) {
        connection = new Pryv.Connection(state.apiEndpoint);
        logToConsole('# Browser succeeded for user ' + connection.apiEndpoint);
      }
      if (state.id === Pryv.Auth.AuthStates.SIGNOUT) {
        connection = null;
        logToConsole('# Logout');
      }
  }
    var serviceInfoUrl = 'https://api.pryv.com/lib-js/demos/service-info.json';
    (async function () {
      var service = await Pryv.Auth.setupAuth(authSettings, serviceInfoUrl);
    })();
  </script>
</body>
</html>
```

#### Fetch access info

Implementation of [access info](https://api.pryv.com/reference/#access-info).

```js
const apiEndpoint = 'https://ck6bwmcar00041ep87c8ujf90@drtom.pryv.me';
const connection = new Pryv.Connection(apiEndpoint);
const accessInfo = await connection.accessInfo();
```

#### Using Service.login() *(trusted apps only)*

[auth.login reference](https://api.pryv.com/reference-full/#login-user)

```javascript
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const appId = 'lib-js-sample';
const service = new Pryv.Service(serviceInfoUrl);
const connection = await service.login(username, password, appId);
```

### API calls

Api calls are based on the `batch` call specifications: [Call batch API reference](https://api.pryv.com/reference/#call-batch)

```javascript
const apiCalls = [
  {
    "method": "streams.create",
    "params": { "id": "heart", "name": "Heart" }
  },
  {
    "method": "events.create",
    "params": { "time": 1385046854.282, "streamIds": ["heart"], "type": "frequency/bpm", "content": 90 }
  },
  {
    "method": "events.create",
    "params": { "time": 1385046854.283, "streamIds": ["heart"], "type": "frequency/bpm", "content": 120 }
  }
]

try {
  const result = await connection.api(apiCalls)
} catch (e) {
  // handle error
}
```

### Advanced usage of API calls with optional individual result and progress callbacks

```javascript
let count = 0;
// the following will be called on each API method result it was provided for
function handleResult(result) { console.log('Got result ' + count++ + ': ' + JSON.stringify(result)); }

function progress(percentage) { console.log('Processed: ' + percentage + '%'); }

const apiCalls = [
  {
    method: 'streams.create',
    params: { id: 'heart', name: 'Heart' }
  },
  {
    method: 'events.create',
    params: { time: 1385046854.282, streamIds: ['heart'], type: 'frequency/bpm', content: 90 },
    handleResult: handleResult
  },
  {
    method: 'events.create',
    params: { time: 1385046854.283, streamIds: ['heart'], type: 'frequency/bpm', content: 120 },
    handleResult: handleResult
  }
]

try {
  const result = await connection.api(apiCalls, progress)
} catch (e) {
  // handle error
}
```

### Get Events Streamed

When `events.get` will provide a large result set, it is recommended to use a method that streams the result instead of the batch API call.

`Pryv.Connection.getEventsStreamed()` parses the response JSON as soon as data is available and calls the `forEachEvent()` callback on each event object.

The callback is meant to store the events data, as the function does not return the API call result, which could overflow memory in case of JSON deserialization of a very large data set.
Instead, the function returns an events count and eventually event deletions count as well as the [common metadata](https://api.pryv.com/reference/#common-metadata).

#### Example:

``````  javascript
const now = (new Date()).getTime() / 1000;
const queryParams = { fromTime: 0, toTime: now, limit: 10000};
const events = [];
function forEachEvent(event) {
  events.push(event);
}

try {
  const result = await connection.getEventsStreamed(queryParams, forEachEvent);
} catch (e) {
  // handle error
}
``````

#### result:

```javascript
{
  eventsCount: 10000,
  meta:
  {
      apiVersion: '1.4.26',
      serverTime: 1580728336.864,
      serial: '2019061301'
  }
}
```

#### Example with Includes deletion:

``````  javascript
const now = (new Date()).getTime() / 1000;
const queryParams = { fromTime: 0, toTime: now, includeDeletions: true, modifiedSince: 0};
const events = [];
function forEachEvent(event) {
  events.push(event);
  // events with .deleted or/and .trashed properties can be tracked here
}

try {
  const result = await connection.getEventsStreamed(queryParams, forEachEvent);
} catch (e) {
  // handle error
}
``````

#### result:

```javascript
{
  eventDeletionsCount: 150,
  eventsCount: 10000,
  meta:
  {
      apiVersion: '1.4.26',
      serverTime: 1580728336.864,
      serial: '2019061301'
  }
}
```





### Events with Attachments

This shortcut allows to create an event with an attachment in a single API call.

#### Node.js

```javascript
const filePath = './test/my_image.png';
const result = await connection.createEventWithFile(
  {
    type: 'picture/attached',
    streamIds: ['data']
  },
  filePath
);
```

or from a Buffer

```javascript
const filePath = './test/my_image.png';
const bufferData = fs.readFileSync(filePath);

const result = await connection.createEventWithFileFromBuffer(
  {
    type: 'picture/attached',
    streamIds: ['data']
  },
  bufferData,
  'my_image.png' // filename
);
```

#### Browser

From an Input field

```html
<input type="file" id="file-upload"><button onClick='uploadFile()'>Save Value</button>

<script>
  var formData = new FormData();
  formData.append(
    'file0',
    document.getElementById('create-file').files[0]
) ;

  connection.createEventWithFormData(
    {
      type: 'file/attached',
      streamIds: ['test']
    },
    formData)
    .then(function (res, err) {
      // handle result here
    }
  );
</script>
```

Progamatically created content:

```javascript
var formData = new FormData();
var blob = new Blob(
  ['Hello'],
  { type: "text/txt" }
);
formData.append("webmasterfile", blob);

connect.createEventWithFormData(
  {
    type: 'file/attached',
    streamIds: ['data']
  },
  formData)
  .then(function (res, err) {
    // handle result here
  }
);

// -- alternative with a filename

connect.createEventWithFileFromBuffer(
  {
    type: 'file/attached',
    streamIds: ['data']
  },
  blob, 'filename.txt')  // here we can directly use the blob
  .then(function (res, err) {
    // handle result here
  }
);


```

### High Frequency Events

Reference: [https://api.pryv.com/reference/#hf-events](https://api.pryv.com/reference/#hf-events)

```javascript
function generateSerie() {
  const serie = [];
  for (let t = 0; t < 100000, t++) { // t will be the deltaTime in seconds
    serie.push([t, Math.sin(t/1000)]);
  }
  return serie;
}
const pointsA = generateSerie();
const pointsB = generateSerie();

function postHFData(points) { // must return a Promise
   return async function (result) { // will be called each time an HF event is created
    return await connection.addPointsToHFEvent(result.event.id, ['deltaTime', 'value'], points);
  }
}

const apiCalls = [
  {
    method: 'streams.create',
    params: { id: 'signal1', name: 'Signal1' }
  },
  {
    method: 'streams.create',
    params: { id: 'signal2', name: 'Signal2' }
  },
  {
    method: 'events.create',
    params: { streamIds: ['signal1'], type: 'serie:frequency/bpm' },
    handleResult: postHFData(pointsA)
  },
  {
    method: 'events.create',
    params: { streamIds: ['signal2'], type: 'serie:frequency/bpm' },
    handleResult: postHFData(pointsB)
  }
]

try {
  const result = await connection.api(apiCalls)
} catch (e) {
  // handle error
}

```

### Service Information and assets

A Pryv.io deployment is a unique "Service", as an example **Pryv Lab** is a service, deployed on the **pryv.me** domain name.

It relies on the content of a **service information** configuration, See: [Service Information API reference](https://api.pryv.com/reference/#service-info)

#### Pryv.Service

Exposes tools to interact with Pryv.io at a "Platform" level.

##### Initizalization with a service info URL

```javascript
const service = new Pryv.Service('https://reg.pryv.me/service/info');
```

##### Initialization with the content of a service info configuration

Service information properties can be overriden with specific values. This might be useful to test new designs on production platforms.

```javascript
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const serviceCustomizations = {
  name: 'Pryv Lab 2',
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
const service = new Pryv.Service(serviceInfoUrl, serviceCustomizations);
```

##### Usage of Pryv.Service.

See: [Pryv.Service](https://pryv.github.io/js-lib/docs/Pryv.Service.html) for more details

- `service.info()` - returns the content of the serviceInfo in a Promise

  ```javascript
  // example: get the name of the platform
  const serviceName = await service.info().name
  ```

- `service.infoSync()`: returns the cached content of the serviceInfo, requires `service.info()` to be called first.

- `service.apiEndpointFor(username, token)` Will return the corresponding API endpoint for the provided credentials, `token` can be omitted.

### Pryv.Browser & Visual assets

#### Pryv.Browser - retrieve serviceInfo from query URL

A single Web App might need to be run on different Pryv.io platforms. This is the case of most Pryv.io demonstrators.

The corresponding Pryv.io platform can be specified by providing the Service Information URL as query parameter `pryvServiceInfoUrl` as per the [Pryv App Guidelines](https://api.pryv.com/guides/app-guidelines/). It can be extracted using `Pryv.Browser.serviceInfoFromUrl()` .

Example of usage for web App with the url https://api.pryv.com/app-web-access/?pryvServiceInfoUrl=https://reg.pryv.me/service/info

```javascript
let defaultServiceInfoUrl = 'https://reg.pryv.me/service/info';
// if present override serviceInfoURL from URL query param "?pryvServiceInfoUrl=.."
serviceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || defaultServiceInfoUrl;

(async function () {
	var service = await Pryv.Auth.setupAuth(authSettings, serviceInfoUrl, serviceCustomizations);
})();
```

#### Visual assets

To customize assets and visuals refer to: [pryv.me assets github](https://github.com/pryv/assets-pryv.me)

To customize the Sign in Button refer to: [sign in button in pryv.me assets](https://github.com/pryv/assets-pryv.me/tree/master/lib-js/)

`(service.assets()).setAllDefaults()`: loads the `css` and `favicon` properties of assets definitions.

```javascript
(async function () {
  const service = await Pryv.Auth.setupAuth(authSettings, serviceInfoUrl);
  (await service.assets()).setAllDefaults(); // will load the default Favicon and CSS for this platform
})();
```

### Customize Auth process

You can customize the authentication process at different levels:

1. [Using a custom login button](#using-your-own-login-button) to launch the [Pryv.io Authentication process](https://api.pryv.com/reference/#authenticate-your-app).
2. Using a custom UI for the [Pryv.io Authentication process](https://api.pryv.com/reference/#authenticate-your-app), including the flow of [app-web-auth3](https://github.com/pryv/app-web-auth3).

#### Using a custom login button

You will need to implement a class that instanciates an [AuthController](src/Auth/AuthController.js) object and implements a few methods. We will go through this guide using the Browser's default [Login Button](src/Browser/LoginButton.js) provided with this library as example.

##### Initialization

You should provide it `authSettings` (See [Obtain a Pryv.Connection](#within-a-webpage-with-a-login-button)) and an instance of [Service](src/Service.js) at initialization. As this phase might contain asynchronous calls, we like to split it between the constructor and an `async init()` function. In particular, you will need to instanciate an [AuthController](src/Auth/AuthController.js) object.

```javascript
constructor(authSettings, service) {
  this.authSettings = authSettings;
  this.service = service;
  this.serviceInfo = service.infoSync();
}

async init () {
  // initialize button visuals
  // ...

  // set cookie key for authorization data - browser only
  this._cookieKey = 'pryv-libjs-' + this.authSettings.authRequest.requestingAppId;

  // initialize controller
  this.auth = new AuthController(this.authSettings, this.service, this);
  await this.auth.init();
}
```

##### Authorization data

At initialization, the [AuthController](src/Auth/AuthController.js) will attempt to fetch some persisted authorization credentials, using `LoginButton.getAuthorizationData()`. In the browser case, we are using a client-side cookie. For other frameworks, use an appropriate secure storage.

```javascript
getAuthorizationData () {
  return Cookies.get(this._cookieKey);
}
```

##### Authentication lifecycle

The [authentication process](https://api.pryv.com/reference/#authenticate-your-app) implementation on the frontend is defined in the following states:

1. Loading: while the visual assets are loading
2. Initialized: visuals assets are loaded, or when [polling](https://api.pryv.com/reference/#poll-request) concludes with **Result: Refused**
3. Need sign in: From the response of the [auth request](https://api.pryv.com/reference/#auth-request) through [polling](https://api.pryv.com/reference/#poll-request)
4. Authorized: When [polling](https://api.pryv.com/reference/#poll-request) concludes with **Result: Accepted**
5. Sign out: When the user triggers a deletion of the client-side authorization credentials, usually by clicking the button after being signed in
6. Error: See message for more information

You will need to provide a function to act depending on the state. The states`NEED_SIGNIN` and `AUTHORIZED` contain the same fields as the [auth process polling responses](https://api.pryv.com/reference/#poll-request). `LOADING`, `INITIALIZED` and `SIGNOUT` only contain `status`. The `ERROR` state carries a `message` property.

```javascript
async onStateChange (state) {
  switch (state.status) {
    case AuthStates.LOADING:
      this.text = getLoadingMessage(this);
      break;
    case AuthStates.INITIALIZED:
      this.text = getInitializedMessage(this, this.serviceInfo.name);
      break;
    case AuthStates.NEED_SIGNIN:
      const loginUrl = state.authUrl || state.url; // .url is deprecated
      if (this.authSettings.authRequest.returnURL) { // open on same page (no Popup)
        location.href = loginUrl;
        return;
      } else {
        startLoginScreen(this, loginUrl);
      }
      break;
    case AuthStates.AUTHORIZED:
      this.text = state.username;
      this.saveAuthorizationData({
        apiEndpoint: state.apiEndpoint,
        username: state.username
      });
      break;
    case AuthStates.SIGNOUT:
      const message = this.messages.SIGNOUT_CONFIRM ? this.messages.SIGNOUT_CONFIRM : 'Logout ?';
      if (confirm(message)) {
        this.deleteAuthorizationData();
        this.auth.init();
      }
      break;
    case AuthStates.ERROR:
      this.text = getErrorMessage(this, state.message);
      break;
    default:
      console.log('WARNING Unhandled state for Login: ' + state.status);
  }
  if (this.loginButtonText) {
    this.loginButtonText.innerHTML = this.text;
  }
}
```

##### Button actions

The button actions should be handled by the [AuthController](src/Auth/AuthController.js) in the following way:

```javascript
// LoginButton.js
onClick () {
  this.auth.handleClick();
}
```

```javascript
// AuthController.js
async handleClick () {
  if (isAuthorized.call(this)) {
    this.state = { status: AuthStates.SIGNOUT };
  } else if (isInitialized.call(this)) {
    this.startAuthRequest();
  } else if (isNeedSignIn.call(this)) {
    // reopen popup
    this.state = this.state;
  } else {
    console.log('Unhandled action in "handleClick()" for status:', this.state.status);
  }
}
```

##### Custom button usage

You must then provide this class as following:

```javascript
let service = await Pryv.Auth.setupAuth(
  authSettings, // See https://github.com/pryv/lib-js#within-a-webpage-with-a-login-button
  serviceInfoUrl,
  serviceCustomizations,
  MyLoginButton,
);
```

You will find a working example in  [`./web-demos/custom-login-button.html`](./web-demos/custom-login-button.html). You can run this code at [https://api.pryv.com/lib-js/demos/custom-login-button.html](https://api.pryv.com/lib-js/demos/custom-login-button.html).

Follow the instructions below on [how to run these examples locally](#launch-web-demos-locally).

For a more advanced scenario, you can check the default button implementation at [`./src/Browser/LoginButton.js`](/src/Browser/LoginButton.js).

#### Redirect user to the authentication page

There is a possibility that you would like to register the user in another page. You can check the [`./web-demos/auth-with-redirection.html`](./web-demos/auth-with-redirection.html) example.
Also you can try the same code in [https://api.pryv.com/lib-js/demos/auth-with-redirection.html](https://api.pryv.com/lib-js/demos/auth-with-redirection.html).
Here is the explanation how to [launch web-demos locally](#launch-web-demos-locally)

### Launch web demos locally

You can find html examples in the [`./web-demos`](/web-demos) directory. You can launch them in 2 ways:

1. using [rec-la](https://github.com/pryv/rec-la) that allows to run your code with a valid SSL certificate (this requires to have run `npm run build` prior). To launch the server you simply need to run:

    ```bash
    npm run webserver
    ```

    and open an example with the following URL **https://l.rec.la:9443/demos/EXAMPLE_NAME.html**, like: [https://l.rec.la:9443/demos/auth.html](https://l.rec.la:9443/demos/auth.html)

2. as a simple html file (service information must be passed as JSON to avoid CORS problem).

# Change Log

## 2.2.0

- Added TypeScript typings – contribution from @ovesco

## 2.1.7

- Removed JSDOC dev dependency for security reason

## 2.1.0

- UI separated from the Authentication logic
- Extendable UI feature was added

## 2.0.3

- Added Connection.username()
- Various dependencies upgrades
- Fixing Origin header in Browser distribution

## 2.0.1 Initial Release
