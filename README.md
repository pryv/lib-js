# Light JavaScript library for Pryv.io

This JS library is meant to facilitate writing NodeJS and browser apps for a Pryv.io platform, it follows the [Pryv.io App Guidelines](https://api.pryv.com/guides/app-guidelines/).

At this date - This is a BETA version 

## Dev

*Prerequisites*: Node 12+

- Install: `npm install`
- Build pryv.js library for browsers: `npm run build` result is published in `./dist`
- Build documentation: `npm run doc` result is published in `./dist/doc` 
- Node Tests: `npm run test`
- Coverage: `npm run cover`result is visible in `./coverage`
- Browser tests: **build**, then `npm run webserver` and open https://l.rec.la:4443/tests/browser-tests.html

## Usage

### In Browser

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
```

### In Node.js


Install with:  `npm install git+https://github.com/pryv/lib-js.git --save ` 

```javascript
const Pryv = require('pryv');
```

### Obtaining a Pryv.Connection 

A connection is an authenticated link to a Pryv.io account.

#### With an APIEndPoint 

Format of an APIEndpoint: `https://{token}@{api-endpoint}/{optional path}` 

```javascript
const apiEndpoint = 'https://TTZycvBTiq@tom.pryv.me';
const connection = new Pryv.Connection(apiEndpoint);
```

If **username** and **token** are known idependently an APIEndPoint can be constructed with:

```javascript
const serviceInfo = 'https://reg.pryv.me/service/info';
const apiEndpoint = Pryv.Service.buildAPIEndpoint(serviceInfo, username, token);
```

#### Within a WebPage

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
      serviceInfoUrl: 'https://api.pryv.com/lib-js/demos/service-info.json',
      languageCode: 'fr', // optional (default english)
      spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
      onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
      authRequest: { // See: http://api.pryv.com/reference/#auth-request
        requestingAppId: 'lib-js-test',
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
      if (state.id === Pryv.Auth.States.AUTHORIZED) {
        connection = new Pryv.Connection(state.apiEndpoint);
        logToConsole('# Auth succeeded for user ' + connection.apiEndpoint);
      }
      if (state.id === Pryv.Auth.States.LOGOUT) {
        connection = null;
        logToConsole('# Logout');
      }
  }
    
    (async function () {
      const service = await Pryv.Auth.setup(authSettings);
    })();
  </script>
</body>
</html>
```

#### Service.login(); *trusted apps only*  http://pryv.github.io/reference-full/#login-user

```javascript
const serviceInfo = 'https://reg.pryv.me/service/info';
const appIdCode = 'lib-js-sample';
const connection = await (new Pryv.Service(serviceInfo)).login(
  username,
  password,
  appIdCode
);
```

### API calls

Api calls are based on the `batch`call specifications: https://api.pryv.com/reference/#call-batch

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

### Advanced usage of Pryv.Connection.api() with `handleResult`and `progress`

```javascript
let count = 0;
// the following will be called for each event it was declared
function handleResult(result) { console.log('Got result ' + count++ +': ' + JSON.result); } 

function progress(percent) { console.log('Processed: ' + percent + '%'); }

const apiCalls = [
  {
    "method": "streams.create",
    "params": { "id": "heart", "name": "Heart" }
  },
  {
    "method": "events.create",
    "params": { "time": 1385046854.282, "streamId": "heart", "type": "frequency/bpm", "content": 90 
               "handleResult": handleResult }
  },
  {
    "method": "events.create",
    "params": { "time": 1385046854.283, "streamId": "heart", "type": "frequency/bpm", "content": 120
      				"handleResult": handleResult }
  }
]

try {
  const result = await connection.api(apiCalls, progress)
} catch (e) {
  // handle error
}
```

### Get Events Streamed

Whenn `event.get` results in a large result set, user streaming of event instead of `Connection.api()` . 

Pryv.getEventStreamed parses the response json as soon as data is available and calls `forEachEvent` each time an event object is found.

The result is transformed and  `events: [..]` array property is replaced by `eventsCount: {Number}`

#### Example:

``````  javascript
const now = (new Date()).getTime() / 1000;
const queryParams = { fromTime: 0, toTime: now, limit: 100000};
let eventsCount = 0;
function forEachEvent(event) {
  counter++; 
}

try {
  const result = await connection.streamedGetEvent(queryParams, forEachEvent);
} catch (e) {
  // handle error
}
``````

#### result:

```json
{ "eventsCount": 10000,
  "meta": 
   { "apiVersion": "1.4.26",
     serverTime: 1580728336.864,
     serial: "2019061301" 
   } 
}
```

### Events with Attachements

#### Node.js

```javascript
const filePath = './test/Y.png';
const result = await connection.createEventWithFile({
  type: 'picture/attached',
  streamId: 'data'
}, filePath); 
```

#### Browser

From an Input field

```html
<input type="file" id="file-upload"><button onClick='uploadFile()'>Save Value</button>

<script>
const formData = new FormData();
formData.append('file0', document.getElementById('create-file').files[0]);
  
connection.createEventWithFormData({ type: 'file/attached', streamId: 'test' },formData)
  .then(function (res, err) {
  	// handle result here
	});
</script>
```

Progamatically created content:

```javascript
const formData = new FormData();
var blob = new Blob(['Hello'], { type: "text/txt" });
formData.append("webmasterfile", blob);

connect.createEventWithFormData({ type: 'file/attached', streamId: 'data'}, formData)
	.then(function (res, err) {
  	// handle result here
	});
```



### HighFrequency Events https://api.pryv.com/reference/#hf-events

```javascript
const pointsA = [];
const pointsB = [];

function fillSerie(serie) {
  for (let t = 0; t < 100000, t++) { // t will be the deltatime in seconds
    serie.push([t, Math.sin(t/1000)]); 
  }
}
fillSerie(pointsA);
fillSerie(pointsB);

function postHFData(points) { // return a Promise
   return async function (result) { // will be called each time an HF event is created
    return await connection.addPointsToHFEvent(result.event.id, ['deltaTime', 'value'], points);
  }
}

const apiCalls = [
  {
    "method": "streams.create",
    "params": { "id": "signal1", "name": "Signal1" }
  },
  {
    "method": "streams.create",
    "params": { "id": "signal2", "name": "Signal2" }
  },
  {
    "method": "events.create",
    "params": { "streamId": "signal1", "type": "serie:frequency/bpm", "handleResult": postHFData(pointsA) }
  },
  {
    "method": "events.create",
    "params": {  "streamId": "signal2", "type": "serie:frequency/bpm", "handleResult": postHFData(pointsB) }
  }
]

try {
  const result = await connection.api(apiCalls, progress)
} catch (e) {
  // handle error
}

```

### Assets & untilites for apps. 

Platfrom specific ressources can be declared within `service/info` with the `assets` properties https://api.pryv.com/reference/#service-info

```javascript
(async function () {
  const service = await Pryv.Auth.setup(authSettings);
  (await service.assets()).setAllDefaults(); // will load the default Favicon and CSS for this platform
})();
```



