# JavaScript library for Pryv.io

This JavaScript library is meant to facilitate writing NodeJS and browser apps for a Pryv.io platform, it follows the [Pryv.io App Guidelines](https://api.pryv.com/guides/app-guidelines/).

## Contribute

*Prerequisites*: Node 12

- Setup: `npm run setup`
- Build pryv.js library for browsers: `npm run build`, the result is published in `./dist`
- Build documentation: `npm run doc`, the result is published in `./dist/doc`
- Node Tests: `npm run test`
- Coverage: `npm run cover`, the result is visible in `./coverage`
- Browser tests: **build**, then `npm run webserver` and open https://l.rec.la:4443/tests/browser-tests.html?pryvServiceInfoUrl=https://zouzou.com/service/info
- Update on CDN: After running **setup** and **build** scripts, run `npm run gh-pages ${COMMIT_MESSAGE}`. If this fails, run `npm run clear` to rebuild a fresh `dist/` folder

## Usage

### Import

#### Browser

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
```

#### Node.js

Install with:  `npm install git+https://github.com/pryv/lib-js.git --save ` 

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

The following code is an implementation of the [Pryv.io Authorization process](https://api.pryv.com/reference/#authorizing-your-app). 

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
        }
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

#### Using Service.login() *(trusted apps only)*

[auth.login reference](https://api.pryv.com/reference-full/#login-user)

```javascript
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const appId = 'lib-js-sample';
const service = new Pryv.Service(serviceInfoUrl);
const connection = await service.login(username, password, appId);
```

### API calls

Api calls are based on the `batch` call specifications: https://api.pryv.com/reference/#call-batch

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
Instead, the function returns an events count as well as the [common metadata](https://api.pryv.com/reference/#common-metadata).

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

### Events with Attachements

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

### Assets & Visual Usage and Customization

To customize assets and visual  refer to: https://github.com/pryv/assets-pryv.me

To customize the Login Button to https://github.com/pryv/assets-pryv.me/tree/master/lib-js/

#### Platfrom-specific ressources 

can be used in a browser with `setAllDefaults()`

This will load the `css` and `favicon` properties of assets definitions.

```javascript
(async function () {
  const service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
  (await service.assets()).setAllDefaults(); // will load the default Favicon and CSS for this platform
})();
```

#### Customize service info 

Service information properties can be overriden with specific values. This might be usefull to test new designs on production platforms.

##### Pryv.Service

At creation of an instance:

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

##### Pryv.Browser

```javascript
var serviceInfoUrl = 'https://reg.pryv.me/service/info';
var serviceCustomizations = {
  name: 'Pryv Lab 2', 
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
var service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl, serviceCustomizations);
```

#### Pryv.Browser - specify Service Information from URL query parameters

A single Web App might need to be run on different Pryv.io platforms. This is the case of most Pryv.io demonstrators.

The **Service Information URL** can be extracted from the URL query parameter `pryvServiceInfoUrl` with `Pryv.Browser.serviceInfoFromUrl()` as per the [Pryv App Guidelines](https://api.pryv.com/guides/app-guidelines/).

Example of usage for web App with the url https://mydomain.com/my-web-app/index.html?pryvServiceInfoUrl=https://my.domain.com/service/info

```javascript
console.log(Pryv.Browser.serviceInfoFromUrl());

let serviceInfoUrl = 'https://reg.pryv.me/service/info';
// the following will override serviceInfoUrl by https://my.domain.com/service/info
serviceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || serviceInfoUrl;
```

