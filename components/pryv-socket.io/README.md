# Socket.IO add-on for `pryv`

Extends the [Pryv JavaScript library](https://github.com/pryv/lib-js) with Socket.IO transport and notifications.


## Usage

The add-on extends `pryv.Connection` instances with a `socket` property.


### Importing

#### NPM

`npm install --save pryv @pryv/socket.io`, then in your code (the add-on must be loaded **once only**):

```js
const pryv = require('pryv');
require('@pryv/socket.io')(pryv);
```

#### `<script>` tag

`pryv-socket.io.js` must be loaded **after** `pryv.js`:

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
<script src="https://api.pryv.com/lib-js/pryv-socket.io.js"></script>
```

Other distributions available:

- ES6 version: `https://api.pryv.com/lib-js-socket.io/pryv-socket.io-es6.js`
- `pryv` library bundled with Socket.IO and Monitor add-ons: `https://api.pryv.com/lib-js/pryv-socket.io-monitor.js`.


### Using `connection.socket`

Once the add-on is loaded, `pryv.Connection` instances expose the `socket` property.

- `connection.socket.open()` (asynchronous) opens the Socket.IO connection. It throws errors on failure.
- `connection.socket.api()` is identical to `Connection.api()` but using the Socket.IO transport (see the [library README](https://github.com/pryv/lib-js#api-calls))
- `connection.socket.on({event-name}, callback)` registers an event listener. Possible event names are:
  - `eventsChanged`: when one or multiples events are deleted, changed or added.
  - `streamsChanged`: when one or multiples streams are deleted, changed or added.
  - `accessChanged`: when an access is deleted or added.
  - `error`: on error. The callback will receive the error as first argument.


### Examples

#### Node.js

```js
const pryv = require('pryv');
require('@pryv/socket.io')(pryv);

const apiEndpoint = 'https://{token}@my-computer.backloop.dev:4443/{username}/';
(async () => {
  const conn = new pryv.Connection(apiEndpoint);
  try {
    await conn.socket.open();
    conn.socket.on('eventsChanged', async () => {
      const res = await conn.socket.api([{method: 'events.get', params: {limit: 2}}]);
    	console.log('Last 2 events: ', JSON.stringify(res, null, 2));
    });
  } catch (e) {
    console.log('An error occured: ', e.message);
  }
})();
```

#### Browser

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
<script src="https://api.pryv.com/lib-js-socket.io/pryv-socket.io.js"></script>

<script>
const apiEndpoint = 'https://{token}@my-computer.backloop.dev:4443/{username}/';
(async function () { 
  try {
    await conn.socket.open();
    conn.socket.on('eventsChanged', async () => {
      const res = await conn.socket.api([{method: 'events.get', params: {limit: 2}}]);
    	console.log('Last 2 events: ', JSON.stringify(res, null, 2));
    });
  } catch (e) {
    console.log('An error occured: ', e.message);
  }
})();
</script>
```

#### Example web app

See [here](../../examples/socket.io.html) for a simple app that allows to log in a Pryv.io platform, register to monitor events changes and create notes. You can try it running [there](https://api.pryv.com/lib-js/examples/socket.io.html).


## Contributing

See the [Pryv JavaScript library README](https://github.com/pryv/lib-js#contributing)


## License

[BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
