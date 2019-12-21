# Light javascript library for Pryv

## Dev

`npm install`

### Build

`npm run build`

result is published in `./dist`directory 


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

### Auth

```
Pryv.auth



```