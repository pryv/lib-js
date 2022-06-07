# Monitor add-on for `pryv`

Extends the [Pryv JavaScript library](https://github.com/pryv/lib-js) with event-driven notifications of changes on a Pryv.io account.


## Usage

The add-on extends `pryv` with a `pryv.Monitor` class.


### Importing

#### NPM

`npm install --save pryv @pryv/monitor`, then in your code (the add-on must be loaded **once only**):

```js
const pryv = require('pryv');
require('@pryv/monitor')(pryv);
```

#### `<script>` tag

`pryv-monitor.js` must be loaded **after** `pryv.js`:

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
<script src="https://api.pryv.com/lib-js/pryv-monitor.js"></script>
```

Other distributions available:

- ES6 version: `https://api.pryv.com/lib-js-monitor/pryv-monitor-es6.js`
- `pryv` library bundled with Socket.IO and Monitor add-ons: `https://api.pryv.com/lib-js/pryv-socket.io-monitor.js`.


### Using `pryv.Monitor`

Once the add-on is loaded, `pryv.Monitor` can be instantiated.

#### Constructor

```js
new pryv.Monitor({apiEndpoint | connection}, eventsGetScope)
```

- `apiEndpoint`: an API endpoint URL (see [app guidelines](https://api.pryv.com/guides/app-guidelines/#auto-configuration))
- `connection`: a `pryv.Connection` instance (see [library README](https://github.com/pryv/lib-js#obtaining-a-pryvconnection))
- `eventsGetScope`: `event.get` parameters (see [API reference](https://api.pryv.com/reference/#get-events))

#### Event listeners

Register event listeners for data changes on the specified scope. `pryv.Monitor` extends [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) so you can register listeners with:

```js
monitor.on(event, callback)
```

The possible events are:

- `event`: on Pryv event **creation** and **update**; callback argument: the Pryv event
- `eventDeleted`: on Pryv event deletion; callback argument: an object with the `id` of the deleted Pryv event (e.g. `{id: "...."}`)
- `streams`: on any change (creation, update, deletion) in the Pryv stream structure; callback argument: a [`streams.get`](https://api.pryv.com/reference/#get-streams) result object (e.g. `{streams: ...}`)
- `error`: on error; callback argument: the error or error message
- `ready`: emitted when the monitor is ready (for internal and `UpdateMethod` usage – see below)
- `stop`: when the monitor stops

#### Start monitoring

```js
await monitor.start()
```

The monitor will fetch the entire dataset in the specified scope then trigger the change events accordingly.

#### Trigger Pryv events update

```js
await monitor.updateEvents()
```

This will push a request to update Pryv events into the task stack. It will be executed as soon as the monitor has finished possible pending tasks.

#### Trigger streams update

```js
await monitor.updateStreams()
```

This will push a request to update Pryv streams into the task stack. It will be executed as soon as the monitor has finished possible pending tasks.

#### Add auto-update method

```js
monitor.addUpdateMethod(updateMethod)
```

Update methods can be triggered automatically with:

- `EventsTimer`
  ```js
  new pryv.Monitor.UpdateMethod.EventsTimer(ms)
  ```
  This will call `monitor.updateEvents()` every `ms` milliseconds (intended for demonstrative purposes).
- `Socket`
  ```js
  new pryv.Monitor.UpdateMethod.Socket()
  ```
  This uses the [Socket.IO add-on](https://github.com/pryv/lib-js/tree/master/components/pryv-socket.io#readme) to relay notifications from Pryv.io to the monitor.
- **Custom**: You can design your own update method by extending the [`UpdateMethod`](https://github.com/pryv/lib-js/tree/master/components/pryv-monitor/src/UpdateMethod/UpdateMethod.js) class.

#### Stop monitoring

```js
monitor.stop()
```

The monitor will stop auto updaters and will throw errors if `updateEvents()` or `updateStreams()` are called.
It can be restarted.


### Known limitation

If an event's update moves it out of the monitor's scope – for example the event's `streamIds` property is updated to a stream not covered by the scope – the Pryv.io API does not currently provide the necessary synchronization mechanism to detect such a change.


### Examples

```js
const apiEndpoint = 'https://ck6bwmcar00041ep87c8ujf90@drtom.pryv.me';

// set monitor scope to the stream 'diary'
const eventsGetScope = {'streamIds': [diary]};

// refresh the monitor using the 'timer' method with a refresh rate of 1 second
const monitor = new pryv.Monitor(apiEndpoint || connection, eventsGetScope)
  .on('event', (event) => {}) // event created or updated
  .on('streams', (streams) => {}) // streams structure changed
  .on('eventDelete', (event) => {}) // event deleted
  .addUpdateMethod(new pryv.Monitor.UpdateMethod.EventsTimer(1000)); // set refresh timer

// start the monitor
(async () => {
  await monitor.start();
}())
```

You can also chain `start()`:

```js
(async () => { 
  const monitor = await (new pryv.Monitor(apiEndpoint || connection, eventsGetScope)
      .on('event', (event) => {}))
    .start();
})();
```

#### Auto-update with web sockets

##### Node.js

Install packages: `npm install pryv @pryv/socket.io @pryv/monitor`

```js
const pryv = require('pryv');
require('@pryv/socket.io')(pryv);
require('@pryv/monitor')(pryv);

const apiEndpoint = 'https://ck60yn9yv00011hd3vu1ocpi7@jslibtest.pryv.me';
(async () => { 
  const monitor = await (new pryv.Monitor(apiEndpoint || connection, eventsGetScope)
      .on('event', (event) => {}))
    .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket())
    .start();
})();
```

##### Browser

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
<script src="https://api.pryv.com/lib-js-socket.io/pryv-socket.io.js"></script>
<script src="https://api.pryv.com/lib-js-monitor/pryv-monitor.js"></script>
<!--
The previous lines can be replaced by the bundled version of the library:
<script src="https://api.pryv.com/lib-js/pryv-socket.io-monitor.js"></script>
-->

<script>
const apiEndpoint = 'https://ck60yn9yv00011hd3vu1ocpi7@jslibtest.pryv.me';
(async () => { 
  const monitor = await (new pryv.Monitor(apiEndpoint || connection, eventsGetScope)
      .on('event', (event) => {}))
    .addUpdateMethod(new pryv.Monitor.UpdateMethod.Socket())
    .start();
})();
</script>
```

#### Example web app

See [here](`../../examples/monitor.html`) for a simple app that allows to sign in to a Pryv.io platform, register to monitor events changes and create notes. You can try it running [there](https://api.pryv.com/lib-js/examples/monitor.html).


## Contributing

See the [Pryv JavaScript library README](https://github.com/pryv/lib-js#contributing)


## License

[BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
