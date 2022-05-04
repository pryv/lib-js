const Pryv = require('pryv');
require('@pryv/socket.io')(Pryv);
require('../src/')(Pryv);

const apiEndpoint = 'https://ck60yn9yv00011hd3vu1ocpi7@jslibtest.pryv.me';

(async () => {
  const monitor = await (new Pryv.Monitor(apiEndpoint, { limit: 20 })
    .on(Pryv.Monitor.Changes.EVENT_DELETE, function (event) {
      console.log('> Delete event', event);
    })
    .on(Pryv.Monitor.Changes.EVENT, function (event) {
      console.log('> New event', event);
    })
    .on(Pryv.Monitor.Changes.STREAMS, function (streams) {
      console.log('> New streams', streams);
    })
    .on(Pryv.Monitor.Changes.STOP, function () {
      console.log('> Event-STOP');
    })
    .on(Pryv.Monitor.Changes.READY, function () {
      console.log('> Event-READY');
    })
    .on(Pryv.Monitor.Changes.ERROR, function (error) {
      console.log('> Event-ERROR: \n' + error);
    })
    //.addUpdateMethod(new Pryv.Monitor.UpdateMethod.EventsTimer(1000))
    .addUpdateMethod(new Pryv.Monitor.UpdateMethod.Socket())
  ).start();
})();


