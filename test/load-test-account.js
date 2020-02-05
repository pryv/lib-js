const testData = require('./test-data.js');
const Pryv = require('../src');

const conn = new Pryv.Connection(testData.pryvApiEndPoints[0]);

const TEST_DATA_VERSION = "v0";


// -- check if account is already loaded 
const res = conn.api([{
  "method": "events.get",
  "params": {
    "streams": ["data"],
    "types": ["test/version"],
    "limit": 1
  }
}]).then((res, err) => { 
  if (res[0].events[0] && res[0].events[0].content === TEST_DATA_VERSION) {
    console.log('TEST ACCOUNT IS UP TO DATE');
  } else {
    doLoad();
  }
});

function doLoad() {
  let query = [
    { // trash eventual stream data
      "method": "streams.delete",
      "params": {
        "id": "data",
        "mergeEventsWithParent": false
      }
    },
    { // clear from trash eventual stream data
      "method": "streams.delete",
      "params": {
        "id": "data",
        "mergeEventsWithParent": false
      }
    },
    {
      "method": "streams.create",
      "params": {
        "id": "data",
        "name": "Test Data",
        "clientData": {
          "pryv-browser:charts": {
            "mass/kg": {
              "settings": {
                "color": "#1abc9c",
                "style": "line",
                "transform": "none",
                "interval": "auto"
              }
            }
          }
        }
      }
    },
    {
      "method": "events.create",
      "params": {
        "streamId": "data",
        "type": "test/version",
        "content": TEST_DATA_VERSION
      }
    }
  ];

  const now = (new Date()).getTime() / 1000;
  const steps = 60 * 60 ; // 1 hours
  for (let i = 0; i < 10000; i++) {
    
    query.push(
      {
        "method": "events.create",
        "params": {
          "time": now - i * steps,
          "streamId": "data",
          "type": "mass/kg",
          "content": Math.sin(i / 180)
        }
      }
    )
  }

  const res = conn.api(query).then((res, err) => {
    console.log(res);
  });
}
