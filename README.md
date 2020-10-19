# JavaScript library for Pryv.io

This JavaScript library is meant to facilitate writing NodeJS and browser apps for a Pryv.io platform, it follows the [Pryv.io App Guidelines](https://api.pryv.com/guides/app-guidelines/).

## Contribute

*Prerequisites*: Node 12

- Setup: `npm run setup`
- Build pryv.js library for browsers: `npm run build`, the result is published in `./dist`
- Build documentation: `npm run doc`, the result is published in `./dist/docs`
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
  - [Performing the Pryv Authentication request with your own UI](#pryv-ui)
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
+ [Customizing the process](#pryv-ui)
  - [Using your own login button](#pryv-ui---using-your-own-login-button)
  - [Using custom authentication UI screens](#pryv-ui---using-custom-authentication-ui-screens)
  
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
      if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
        connection = new Pryv.Connection(state.apiEndpoint);
        logToConsole('# Browser succeeded for user ' + connection.apiEndpoint);
      }
      if (state.id === Pryv.Browser.AuthStates.LOGOUT) {
        connection = null;
        logToConsole('# Logout');
      }
  }
    var serviceInfoUrl = 'https://api.pryv.com/lib-js/demos/service-info.json';
    (async function () {
      var service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
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
    "params": { "time": 1385046854.282, "streamId": "heart", "type": "frequency/bpm", "content": 90 }
  },
  {
    "method": "events.create",
    "params": { "time": 1385046854.283, "streamId": "heart", "type": "frequency/bpm", "content": 120 }
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
    params: { time: 1385046854.282, streamId: 'heart', type: 'frequency/bpm', content: 90 },
    handleResult: handleResult
  },
  {
    method: 'events.create',
    params: { time: 1385046854.283, streamId: 'heart', type: 'frequency/bpm', content: 120 },
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
    streamId: 'data'
  },
  filePath
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
      streamId: 'test'
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
    streamId: 'data'
  },
  formData)
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
  for (let t = 0; t < 100000, t++) { // t will be the deltatime in seconds
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
    params: { streamId: 'signal1', type: 'serie:frequency/bpm' },
    handleResult: postHFData(pointsA)
  },
  {
    method: 'events.create',
    params: { streamId: 'signal2', type: 'serie:frequency/bpm' },
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
	var service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl, serviceCustomizations);
})();
```

#### Visual assets

To customize assets and visuals refer to: [pryv.me assets github](https://github.com/pryv/assets-pryv.me)

To customize the Sign in Button refer to: [sign in button in pryv.me assets](https://github.com/pryv/assets-pryv.me/tree/master/lib-js/)

`(service.assets()).setAllDefaults()`: loads the `css` and `favicon` properties of assets definitions.

```javascript
(async function () {
  const service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
  (await service.assets()).setAllDefaults(); // will load the default Favicon and CSS for this platform
})();
```

### Pryv UI
Lib-js ships with pre-built authentication service, that you would get as a response
from `Pryv.Browser.setupAuth` method. Lib-js will help you with

    1. Retrieving service information
    2. Retrieving button assets from service information
    3. Calling /access method 
    4. Calling login method
    5. Calling logout method
    6. Default authentication using token information stored in the cookie 

#### Using your own login button

In the `Visual Assets` section it was presented how to customize your
platform styles. Here you will find how to get more advanced and customize
Login button and it's logic for the steps mentioned above. 

In a `./web-demos/custom-login-button.html` you can find an example how you can do so.
Also you can try the same code in [https://api.pryv.com/lib-js/demos/custom-login-button.html](https://api.pryv.com/lib-js/demos/custom-login-button.html)

#### Using custom authentication UI screens

In a section 'Within a WebPage with a login button' we have mentioned that you can create function that monitors the  change of authentication `state`. The simplest function example is this:
```
function pryvAuthStateChange(state) { // called each time the authentication state changed
  switch(state.id) {
      case Pryv.Browser.AuthStates.LOADING:
        console.log('Loading service information...');
        break;
      case Pryv.Browser.AuthStates.INITIALIZED:
        console.log('Service information is retrieved so authorization can start. You can display login / registration screen or redirect to the our hosted app - web - auth application.');
        break;
      case Pryv.Browser.AuthStates.AUTHORIZED:
        console.log('User is authorized and can access his personal data');
        break;
      case Pryv.Browser.AuthStates.LOGOUT:
        console.log('User just logged off, please delete all the session related data');
        break;
      case Pryv.Browser.AuthStates.ERROR:
        console.log('Error:', state?.message);
        break;
  }
}
```

Using the information about the state changes, you can render the right views accordingly.
Check the examples in the [examles section]('#examples').

#### Redirect user to the authentication page

There is possibility that you would like to register user in another page. You can
check `./web-demos/auth-with-redirection.html` example.
Also you can try the same code in [https://api.pryv.com/lib-js/demos/auth-with-redirection.html](https://api.pryv.com/lib-js/demos/auth-with-redirection.html)

##### Examples
  1. [Mini React-Native app](https://github.com/pryv/lib-js-react-native) using lib-js authentication with custom UI screens.
   

# Change Log

## 2.1.0

- UI separated from the Authentication logic
- Extendable UI feature was added

## 2.0.3 

- Added Connection.username() 
- Various dependencies upgrades
- Fixing Origin header in Browser distribution

## 2.0.1 Initial Release 
