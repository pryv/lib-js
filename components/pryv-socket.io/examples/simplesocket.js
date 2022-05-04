const Pryv = require('pryv');
require('../src/')(Pryv);

let apiEndpoint = 'https://ckbcft5ai0004z60sbsmv56mc@my-computer.rec.la:4443/perki/';

const conn = new Pryv.Connection(apiEndpoint);

(async () => { 
  try {
    const s = await conn.socket.open();
    s.on('eventsChanged',async () => {
      console.log('Got eventsChanged');
      const res = await conn.socket.api([{ method: 'events.get', params: {limit: 1 } }]);
      console.log('Last event: ', JSON.stringify(res, null, 2));
    });
    
  } catch (e) {
    console.log('Error: ', e.message);
  }
})();