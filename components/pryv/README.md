# `pryv`: JS library for Pryv.io

[![codecov](https://codecov.io/gh/pryv/lib-js/graph/badge.svg?token=IDE5F6NFZR)](https://codecov.io/gh/pryv/lib-js)

JavaScript library and add-ons for writing Node.js and browser apps connecting to a Pryv.io platform. It follows the [Pryv.io app guidelines](https://api.pryv.com/guides/app-guidelines/).


## Table of Contents <!-- omit in toc -->

1. [Usage](#usage)
   1. [Importing](#importing)
   2. [Quick example](#quick-example)
   3. [Obtaining a `pryv.Connection`](#obtaining-a-pryvconnection)
   4. [API calls](#api-calls)
   5. [Get events streamed](#get-events-streamed)
   6. [Events with attachments](#events-with-attachments)
   7. [High Frequency (HF) events](#high-frequency-hf-events)
   8. [Service information and assets](#service-information-and-assets)
   9. [`pryv.Browser` & visual assets](#pryvbrowser--visual-assets)
   10. [Customize the authentication process](#customize-the-authentication-process)
   11. [Running examples locally](#running-examples-locally)
2. [Contributing](#contributing)
   1. [Installation](#installation)
   2. [Dev environment basics](#dev-environment-basics)
   3. [Building for the browser](#building-for-the-browser)
   4. [Testing](#testing)
   5. [Publishing](#publishing)
3. [Changelog](#changelog)
4. [License](#license)


## Usage


### Importing

#### NPM

`npm install --save pryv`, then in your code:

```js
const pryv = require('pryv');
```

#### `<script>` tag

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
```

Other distributions available:

- ES6: `https://api.pryv.com/lib-js/pryv-es6.js`
- Library bundled with Socket.IO and Monitor add-ons: `https://api.pryv.com/lib-js/pryv-socket.io-monitor.js`.

#### Add-ons

- Socket.IO: [NPM package](https://www.npmjs.com/package/@pryv/socket.io), [README](https://github.com/pryv/lib-js/tree/master/components/pryv-socket.io#readme)
- Monitor: [NPM package](https://www.npmjs.com/package/@pryv/monitor), [README](https://github.com/pryv/lib-js/tree/master/components/pryv-monitor#readme)


### Quick example

- [A simple form to save notes and measurements (CodePen)](https://codepen.io/pryv/pen/ExVYemE)


### Obtaining a `pryv.Connection`

A connection is an authenticated link to a Pryv.io account.

#### With an API endpoint

The format of the API endpoint can be found in your platform's [service information](https://api.pryv.com/reference/#service-info) under the `api` property. It usually looks like: `https://{token}@{hostname}`

```js
const apiEndpoint = 'https://ck6bwmcar00041ep87c8ujf90@drtom.pryv.me';
const connection = new pryv.Connection(apiEndpoint);
```

#### With username & token (knowing the service information URL)

```js
const service = new pryv.Service('https://reg.pryv.me/service/info');
const apiEndpoint = await service.apiEndpointFor(username, token);
const connection = new pryv.Connection(apiEndpoint);
```

#### Within a web page with a login button

Here is an implementation of the [Pryv.io authentication process](https://api.pryv.com/reference/#authenticate-your-app):

```html
<!doctype html>
<html>
<head>
  <title>Pryv authentication example</title>
  <script src="https://api.pryv.com/lib-js/pryv.js"></script>
</head>
<body>
  <span id="pryv-button"></span>
  <script>
    var connection = null;

    var authSettings = {
      spanButtonID: 'pryv-button', // id of the <span> that will be replaced by the service-specific button
      onStateChange: authStateChanged, // event listener for authentication steps
      authRequest: { // See: https://api.pryv.com/reference/#auth-request
        requestingAppId: 'lib-js-test',
        languageCode: 'fr', // optional (default: 'en')
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
    var serviceInfoUrl = 'https://api.pryv.com/lib-js/examples/service-info.json';
    (async function () {
      var service = await pryv.Auth.setupAuth(authSettings, serviceInfoUrl);
    })();

    function authStateChanged(state) { // called each time the authentication state changes
      console.log('# Auth state changed:', state);
      if (state.id === pryv.Auth.AuthStates.AUTHORIZED) {
        connection = new pryv.Connection(state.apiEndpoint);
        logToConsole('# Browser succeeded for user ' + connection.apiEndpoint);
      }
      if (state.id === pryv.Auth.AuthStates.SIGNOUT) {
        connection = null;
        logToConsole('# Signed out');
      }
    }
  </script>
</body>
</html>
```

#### Fetching access info

[API reference](https://api.pryv.com/reference/#access-info).

```js
const apiEndpoint = 'https://ck6bwmcar00041ep87c8ujf90@drtom.pryv.me';
const connection = new pryv.Connection(apiEndpoint);
const accessInfo = await connection.accessInfo();
```

#### Using `pryv.Service.login()` _(trusted apps only)_

[API reference](https://api.pryv.com/reference-full/#login-user)

```js
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const appId = 'lib-js-sample';
const service = new pryv.Service(serviceInfoUrl);
const connection = await service.login(username, password, appId);
```


### API calls

API calls are based on the "batch" call specification: [Call batch API reference](https://api.pryv.com/reference/#call-batch)

#### Simple usage

```js
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

#### Advanced usage with optional individual result and progress callbacks

```js
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


### Get events streamed

When `events.get` will provide a large result set, it is recommended to use a method that streams the result instead of the batch API call.

`pryv.Connection.getEventsStreamed()` parses the response JSON as soon as data is available and calls the `forEachEvent` callback for each event object.

The callback is meant to store the events data, as the function does not return the API call result, which could overflow memory in case of JSON deserialization of a very large data set. Instead, the function returns an events count and possibly event deletions count as well as the [common metadata](https://api.pryv.com/reference/#common-metadata).

#### Example

```js
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
```

`result`:

```js
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

#### Example including deletions

```js
const now = (new Date()).getTime() / 1000;
const queryParams = { fromTime: 0, toTime: now, includeDeletions: true, modifiedSince: 0};
const events = [];
function forEachEvent(event) {
  events.push(event);
  // events with `deleted` or/and `trashed` properties can be tracked here
}

try {
  const result = await connection.getEventsStreamed(queryParams, forEachEvent);
} catch (e) {
  // handle error
}
```

`result`:

```js
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


### Events with attachments

You can create an event with an attachment in a single API call.

#### Node.js

```js
const filePath = './test/my_image.png';
const result = await connection.createEventWithFile({
  type: 'picture/attached',
  streamIds: ['data']
}, filePath);
```

Or from a `Buffer`:

```js
const filePath = './test/my_image.png';
const bufferData = fs.readFileSync(filePath);

const result = await connection.createEventWithFileFromBuffer({
  type: 'picture/attached',
  streamIds: ['data']
}, bufferData, 'my_image.png' /* ← filename */);
```

#### Browser

From an `<input>`:

```html
<input type="file" id="file-upload"><button onClick='uploadFile()'>Save Value</button>

<script>
  var formData = new FormData();
  formData.append('file0', document.getElementById('create-file').files[0]) ;

  connection.createEventWithFormData({
    type: 'file/attached',
    streamIds: ['test']
  }, formData).then(function (res, err) {
    // handle result
  });
</script>
```

Programmatically created content:

```js
var formData = new FormData();
var blob = new Blob(['Hello'], { type: "text/txt" });
formData.append("file", blob);

connect.createEventWithFormData({
  type: 'file/attached',
  streamIds: ['data']
}, formData).then(function (res, err) {
  // handle result
});

// Alternative with a filename

connect.createEventWithFileFromBuffer({
  type: 'file/attached',
  streamIds: ['data']
}, blob /* ← here we can directly use the blob*/, 'filename.txt').then(function (res, err) {
  // handle result
});
```


### High Frequency (HF) events

[API reference](https://api.pryv.com/reference/#hf-events)

```js
function generateSeries() {
  const series = [];
  for (let t = 0; t < 100000, t++) { // t will be the deltaTime in seconds
    series.push([t, Math.sin(t/1000)]);
  }
  return series;
}
const pointsA = generateSeries();
const pointsB = generateSeries();

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
    params: { streamIds: ['signal1'], type: 'series:frequency/bpm' },
    handleResult: postHFData(pointsA)
  },
  {
    method: 'events.create',
    params: { streamIds: ['signal2'], type: 'series:frequency/bpm' },
    handleResult: postHFData(pointsB)
  }
];

try {
  const result = await connection.api(apiCalls);
} catch (e) {
  // handle error
}
```


### Service information and assets

Each Pryv.io platform is considered a "service"; for example **Pryv Lab**, which is deployed on the **pryv.me** domain.
It is described by a **service information** settings object (see the [service info API reference](https://api.pryv.com/reference/#service-info)).

`pryv.Service` exposes tools to interact with Pryv.io at the "platform" level.

#### Initializing with a service info URL

```js
const service = new pryv.Service('https://reg.pryv.me/service/info');
```

#### Initializing with a service info settings object

Service information properties can be overridden, which can be useful to test new designs on production platforms.

```js
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const overrides = {
  name: 'Pryv Lab 2',
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
const service = new pryv.Service(serviceInfoUrl, overrides);
```

#### Methods

- `service.info()` returns the service information in a Promise
  ```js
  // get the name of the platform
  const serviceName = await service.info().name
  ```
- `service.infoSync()` returns the cached service info; requires `service.info()` to be called beforehand
- `service.apiEndpointFor(username, token)` returns the corresponding API endpoint for the provided credentials (`token` is optional)


### `pryv.Browser` & visual assets

#### Retrieving the service info from a query parameter

A single web app might need to run on different Pryv.io platforms (this is the case of most Pryv.io example apps).

The Pryv.io platform can be specified by passing the service information URL in a query parameter `pryvServiceInfoUrl` (as per the [Pryv app guidelines](https://api.pryv.com/guides/app-guidelines/)), which can be extracted with `pryv.Browser.serviceInfoFromUrl()`.

For example: `https://api.pryv.com/app-web-access/?pryvServiceInfoUrl=https://reg.pryv.me/service/info`

```js
let defaultServiceInfoUrl = 'https://reg.pryv.me/service/info';
// if present, override serviceInfoURL from query param `pryvServiceInfoUrl`
serviceInfoUrl = pryv.Browser.serviceInfoFromUrl() || defaultServiceInfoUrl;

(async function () {
	var service = await pryv.Auth.setupAuth(authSettings, serviceInfoUrl, serviceCustomizations);
})();
```

#### Visual assets

To customize visual assets, please refer to the [pryv.me assets repository](https://github.com/pryv/assets-pryv.me). For example, see [how to customize the sign-in button](https://github.com/pryv/assets-pryv.me/tree/master/lib-js/).

`(await service.assets()).setAllDefaults()` loads the `css` and `favicon` properties of assets definitions:

```js
(async function () {
  const service = await pryv.Auth.setupAuth(authSettings, serviceInfoUrl);
  (await service.assets()).setAllDefaults(); // will load the default favicon and CSS for this platform
})();
```


### Customize the authentication process

You can customize the authentication process ([API reference](https://api.pryv.com/reference/#authenticate-your-app)) at different levels:

- Using a custom login button
- Using a custom UI, including the flow of [app-web-auth3](https://github.com/pryv/app-web-auth3)

#### Using a custom login button

You will need to implement a class that instanciates an [AuthController](src/Auth/AuthController.js) object and implements a few methods. We will go through this guide using the Browser's default [login button](src/Browser/LoginButton.js) provided with this library as example.

##### Initialization

You should provide auth settings (see [obtaining a `pryv.Connection`](#within-a-webpage-with-a-login-button)) and an instance of [pryv.Service](src/Service.js) at initialization. As this phase might contain asynchronous calls, we like to split it between the constructor and an `async init()` function. In particular, you will need to instanciate an [AuthController](src/Auth/AuthController.js) object.

```js
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

At initialization, the [AuthController](src/Auth/AuthController.js) will attempt to fetch persisted authorization credentials, using `LoginButton.getAuthorizationData()`. In the browser, we are using a client-side cookie. For other frameworks, use an appropriate secure storage.

```js
getAuthorizationData () {
  return Cookies.get(this._cookieKey);
}
```

##### Authentication lifecycle

The [authentication process](https://api.pryv.com/reference/#authenticate-your-app) implementation on the frontend can go through the following states:

1. `LOADING`: while the visual assets are loading
2. `INITIALIZED`: visuals assets are loaded, or when [polling](https://api.pryv.com/reference/#poll-request) concludes with **Result: Refused**
3. `NEED_SIGNIN`: from the response of the [auth request](https://api.pryv.com/reference/#auth-request) through [polling](https://api.pryv.com/reference/#poll-request)
4. `AUTHORIZED`: When [polling](https://api.pryv.com/reference/#poll-request) concludes with **Result: Accepted**
5. `SIGNOUT`: when the user triggers a deletion of the client-side authorization credentials, usually by clicking the button after being signed in
6. `ERROR`: see message for more information

You will need to provide a function to react depending on the state. The states `NEED_SIGNIN` and `AUTHORIZED` carry the same properties as the [auth process polling responses](https://api.pryv.com/reference/#poll-request). `LOADING`, `INITIALIZED` and `SIGNOUT` only have `status`. The `ERROR` state carries a `message` property.

```js
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

```js
// LoginButton.js
onClick () {
  this.auth.handleClick();
}
```

```js
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

You must then provide this class as follows:

```js
let service = await pryv.Auth.setupAuth(
  authSettings, // See https://github.com/pryv/lib-js#within-a-webpage-with-a-login-button
  serviceInfoUrl,
  serviceCustomizations,
  MyLoginButton,
);
```

You will find a working example [here](https://github.com/pryv/lib-js/blob/master/examples/custom-login-button.html), and try it running [there](https://api.pryv.com/lib-js/examples/custom-login-button.html). To run these examples locally, see below.

For a more advanced scenario, you can check the default button implementation in [`./src/Browser/LoginButton.js`](/src/Browser/LoginButton.js).

#### Redirect user to the authentication page

There is a possibility that you would like to register the user in another page. You can find an example [here](https://github.com/pryv/lib-js/blob/master/examples/auth-with-redirection.html), and try it running [there](https://api.pryv.com/lib-js/examples/auth-with-redirection.html). Again, to run these examples locally, see below.


### Running examples locally

You can find HTML examples in the [`./examples`](https://github.com/pryv/lib-js/blob/master/examples) directory. You can run them in two ways:

1. With [backloop.dev](https://github.com/pryv/backloop.dev), which allows to run local code with a valid SSL certificate (you must have run `just build` beforehand):
   ```
   just serve
   ```
   then open the desired example page (e.g. [https://l.backloop.dev:9443/examples/auth.html](https://l.backloop.dev:9443/examples/auth.html)
2. As a simple HTML file, passing service information as JSON to avoid CORS issues


## Contributing

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/download/) 16, [just](https://github.com/casey/just#installation)

Then:
1. `just setup-dev-env`
2. `just install` to install node modules
3. `just build` for the initial webpack build

Running `just` with no argument displays the available commands (defined in `justfile`).

### Dev environment basics

The project is structured as a monorepo with components (a.k.a. workspaces in NPM), each component defining its `package.json`, tests, etc. in `components/`:
- `pryv`: the library
- `pryv-socket.io`: Socket.IO add-on
- `pryv-monitor`: Monitor add-on



The code follows the [Semi-Standard](https://github.com/standard/semistandard) style.

### Building for the browser

```
just build[-watch]
```
to build the library, add-ons and examples into `dist/`, and the browser tests into `test-browser/`

### Testing

#### Node.js

```
just test <component> [...params]
```
- `component` is an existing component's name, or `all` to run tests on all components
- Extra parameters at the end are passed on to [Mocha](https://mochajs.org/) (default settings are defined in `.mocharc.js` files)
- Replace `test` with `test-debug`, `test-cover` for common presets

By default, tests are run against [Pryv Lab](https://www.pryv.com/pryvlab/) with service information URL `https://reg.pryv.me/service/info`.

To run the tests against another Pryv.io platform, set the `TEST_PRYVLIB_SERVICEINFO_URL` environment variable; for example:

```bash
TEST_PRYVLIB_SERVICEINFO_URL="https://reg.${DOMAIN}/service/info" just test all
```

To run the tests against _in-development_ API server components (e.g. open-source or Entreprise), set `TEST_PRYVLIB_DNSLESS_URL`; for example:

```bash
TEST_PRYVLIB_DNSLESS_URL="http://l.backloop.dev:3000/ just test all
```

#### Browser

Assuming browser files have been built (see above):
```
just test-browser
```
to run the tests in a browser window.

- Update on CDN: After running **setup** and **build** scripts, run `npm run gh-pages ${COMMIT_MESSAGE}`. If this fails, run `npm run clear` to rebuild a fresh `dist/` folder

### Publishing

Assuming browser files are built and everything is up-to-date, including the READMEs and [changelog](https://github.com/pryv/lib-js/blob/master/CHANGELOG.md):

```
just version <version>
```
to update the version number of the lib and add-ons in lockstep, git commit and tag included

```
just publish-npm
```
to publish the new versions of the lib and add-ons to NPM

```
just publish-browser
```
to commit and push the `gh-pages` branch from `dist/`, publishing the browser files to be served via CDN on `api.pryv.com/lib-js`


## [Changelog](CHANGELOG.md)


## License

[BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
