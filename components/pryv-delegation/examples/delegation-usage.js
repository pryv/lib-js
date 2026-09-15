/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * @pryv/delegation — end-to-end usage example.
 *
 * A guardian ("A") creates a controlled account for a child ("B"), acts on
 * that account through a delegate token, then tears the relationship down.
 * Run with a real personal API endpoint:
 *
 *   node delegation-usage.js 'https://<token>@<username>.pryv.me/'
 *
 * The token must be a PERSONAL access token on the guardian's account.
 */

const pryv = require('pryv');
const { Delegation, errorIds } = require('@pryv/delegation');

async function main () {
  const guardianApiEndpoint = process.argv[2];
  if (guardianApiEndpoint == null) {
    console.error('Usage: node delegation-usage.js <guardian personal apiEndpoint>');
    process.exit(1);
  }

  const guardianConn = new pryv.Connection(guardianApiEndpoint);
  const delegation = Delegation.fromConnection(guardianConn);

  // 1. Create a brand-new controlled account (active at birth). Omit the
  //    password to make it reachable only through delegates.
  const childUsername = 'kid-' + Date.now();
  const created = await delegation.createAccount({ username: childUsername });
  console.log('created controlled account:', created.delegation.controlled.username,
    '(status:', created.delegation.status + ')');

  // 2. List the accounts we control.
  const controlled = await delegation.listControlled();
  console.log('controlled accounts:', controlled.map((c) => c.controlled.username + ' [' + c.status + ']'));

  // 3. Act as the child account in one call — a ready Connection onto B.
  const childConn = await delegation.openControlled(childUsername);
  const created2 = await childConn.apiOne('events.create', {
    streamIds: ['diary'],
    type: 'note/txt',
    content: 'first note, written by the guardian on the child account'
  }, 'event');
  console.log('wrote event on the child account:', created2.id);

  // 4. (Optional) Add a co-guardian by inviting another account as a delegate.
  //    Uncomment with a real second username:
  // const invite = await delegation.requestAttach('other-parent');
  // console.log('invited co-guardian, invite expires at', invite.expiresAt);

  // 5. Detach requires a GENUINE login on the controlled account. From this
  //    guardian (delegate) connection it is refused — surface it distinctly.
  try {
    await delegation.detachDelegate('other-parent');
  } catch (err) {
    if (err.id === errorIds.GENUINE_LOGIN_REQUIRED) {
      console.log('detach refused: the account owner must log in directly to remove a delegate');
    } else if (err.id === errorIds.NOT_FOUND) {
      console.log('detach: no such delegate (expected in this sample)');
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error('delegation example failed:', err.id || '', err.message);
  process.exit(1);
});
