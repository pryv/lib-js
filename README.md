# Light javascript library for Pryv

## Dev

- Install: `npm install`
- Build pryv.js library for browsers: `npm run build` result is published in `./dist`
- Build documentation: `npm run doc` result is published in ` ./dist/doc` 
- Node Tests: `npm run test`
- Coverage: `npm run cover`result is visible in `./coverage`
- Browser tests:  **build**, then`npm run webserver `and open https://l.rec.la:4443/dist/browser-tests.html


## Lib documentation

### Pryv.Connection

A connection is a link to a single Pryv API endoints.

#### Init 

```javascript
const pryvApiEndpoint = 'https://{access token}@{username}.{domain}/';
const conn = new Pryv.connection(pryvEndpoint);
```

#### API call

```javascript
const apiCalls = [
  {
    "method": "events.create",
    "params": {
      "time": 1385046854.282,
      "streamId": "heart",
      "type": "frequency/bpm",
      "content": 90
    }
  },
  {
    "method": "events.create",
    "params": {
      "time": 1385046854.282,
      "streamId": "systolic",
      "type": "pressure/mmhg",
      "content": 120
    }
  }
]

try {
  const result = await conn.api(apiCalls)
} catch (e) {
  // handle error
}
```

### Service

```javascript
const pryvService = new Pryv.Service('https://reg.pryv.me/service/info');

const pryvServiceInfo = await pryvService.info(); // return current service info or fetch if needed
```



### Auth

```javascript
Pryv.Auth.setup(settings);



```

# Todos

Whishlist and todos.

1. Review Connection.options setters design

2. Add **Auto-load service info** and event listener

3. Add Monitor and Filter with synchronization method

4. Implement Get call with streaming of result

5. Add HF event manipulation 

6. Add Attachment support

7. Auth: Check permission format at set-up

   