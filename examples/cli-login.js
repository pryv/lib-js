/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 *
 * Headless (CLI) login pattern — pattern reference.
 *
 * Run with: `node examples/cli-login.js [serviceInfoUrl]`
 *
 * This script demonstrates how a non-browser caller (CLI, daemon, bot) can
 * drive the Pryv access-request flow without a popup or iframe. The user
 * still authorises in a browser tab they open themselves; this process
 * polls until the request is accepted or refused.
 *
 * The script uses only public `Service` methods:
 *   - `service.startAccessRequest(authRequest)` to issue the request
 *   - `service.pollAccessRequest(key)` to poll until completion
 *
 * It is intentionally dependency-free (no `open` package, no extra prompts).
 * Adapters that want a richer UX layer their own niceties on top.
 */

'use strict';

const pryv = require('../components/pryv/src');

const DEFAULT_SERVICE_INFO_URL = 'https://reg.pryv.me/service/info';
const APP_ID = 'lib-js-cli-login-example';

async function main () {
  const serviceInfoUrl = process.argv[2] || DEFAULT_SERVICE_INFO_URL;

  console.log(`Resolving service info from ${serviceInfoUrl} ...`);
  const service = new pryv.Service(serviceInfoUrl);
  await service.info();

  const { key, authUrl, pollRateMs } = await service.startAccessRequest({
    requestingAppId: APP_ID,
    requestedPermissions: [
      { streamId: 'diary', defaultName: 'Diary', level: 'manage' }
    ]
  });

  // The `cli` flag tells the auth UI to render a terminal "you can close
  // this window" screen on success instead of trying to redirect or close
  // a popup that the CLI never opened.
  const authUrlForCli = appendCliFlag(authUrl);

  console.log();
  console.log('Open the following URL in your browser to authorise:');
  console.log();
  console.log('  ' + authUrlForCli);
  console.log();
  console.log(`Polling key ${key} every ${pollRateMs}ms ...`);

  const terminalStatus = await waitForTerminalStatus(service, key, pollRateMs);

  if (terminalStatus === 'ACCEPTED') {
    // Strict surface: the caller resolves the key to a Connection via
    // `service.connectFromKey(key)`. The `apiEndpoint` / `token` stay
    // inside the lib.
    const connection = await service.connectFromKey(key);
    const [eventsRes] = await connection.api([
      { method: 'events.get', params: { limit: 1 } }
    ]);
    const count = (eventsRes && eventsRes.events) ? eventsRes.events.length : 0;
    console.log(`Logged in. Sample events.get returned ${count} event(s).`);
    process.exit(0);
  }

  if (terminalStatus === 'REFUSED') {
    console.error('Access refused by the user.');
    process.exit(2);
  }

  console.error('Unexpected terminal state: ' + terminalStatus);
  process.exit(3);
}

async function waitForTerminalStatus (service, key, pollRateMs) {
  for (;;) {
    const body = await service.pollAccessRequest(key);
    if (body.status === 'NEED_SIGNIN') {
      await sleep(pollRateMs);
      continue;
    }
    return body.status;
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function appendCliFlag (url) {
  if (!url) return url;
  return url + (url.includes('?') ? '&' : '?') + 'cli=1';
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
