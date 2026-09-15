# Account-delegation client helpers for `pryv`

Account-delegation client-side helpers for the [Pryv JavaScript library](https://github.com/pryv/lib-js). Delegation lets one account (the **delegate**, "A") act on behalf of another (the **controlled** account, "B") through a delegate personal-access token (PAT) minted on B — for example a parent running a child's account, or a co-guardian added to an existing one. It is backed by the open-pryv.io `delegation` plugin (`delegations.*` API family).


## Usage

`@pryv/delegation` is a **sibling package** to `pryv` — imported separately, not attached to the `pryv` namespace. It uses a standard personal `pryv.Connection` to talk to the server.


### Importing

#### NPM

`npm install --save pryv @pryv/delegation`, then in your code:

```js
const pryv = require('pryv');
const { Delegation } = require('@pryv/delegation');
```

`@pryv/delegation` requires `pryv@^3.3.0` as a peer dependency.

#### `<script>` tag

`pryv-delegation.js` must be loaded **after** `pryv.js`. In browser bundles, pass the `pryv` module explicitly (needed by `openControlled`, which constructs a `Connection`):

```js
const delegation = Delegation.fromConnection(conn, { pryv: window.pryv });
```


## Concepts

A delegation relationship has two sides:

- **B — the controlled account.** Invites a delegate (`requestAttach`), lists its delegates (`listDelegates`), and is the **only** party that can authoritatively remove one (`detachDelegate`). Teardown requires a **genuine login** on B (see below).
- **A — the delegate.** Accepts or refuses an invite (`acceptAttach` / `refuseAttach`), lists the accounts it controls (`listControlled`), mints a token for one (`getToken` / `openControlled`), and can create brand-new controlled accounts (`createAccount`).

Every method maps to exactly one `delegations.*` API method, issued over the connection's batch call.


## Surface

Construct a client by wrapping a personal `pryv.Connection`:

```js
const delegation = Delegation.fromConnection(conn);
```

### B side (the controlled account)

```js
// Invite a delegate. Returns the pending invite record.
const invite = await delegation.requestAttach('parent-b');
// invite = { relId, delegate: { username }, status: 'invite', requestedAt, expiresAt }

// List your delegates (status: 'invite' | 'active').
const delegates = await delegation.listDelegates();
// [ { relId, delegate: { username, hostSlug }, status, requestedAt, activatedAt?, lastTokenIssuedAt? } ]

// Cancel a pending invite you issued (genuine-login-gated, see below).
await delegation.cancelInvite('parent-b');

// Remove a delegate — the authoritative teardown (genuine-login-gated).
await delegation.detachDelegate('parent-b');
```

### A side (the delegate)

```js
// Accept / refuse an invite you received.
const rel = await delegation.acceptAttach('kid-account');
// rel = { relId, controlled: { username }, status: 'active', activatedAt }
await delegation.refuseAttach('kid-account');

// List the accounts you control (status: 'invite' | 'active' | 'stale').
const controlled = await delegation.listControlled();
// [ { relId, controlled: { username, hostSlug }, status, requestedAt, activatedAt? } ]

// Dismiss a local 'stale' mirror (housekeeping — removes no authority).
await delegation.dismissControlled('old-account');

// Mint a delegate token for a controlled account.
const { token, apiEndpoint } = await delegation.getToken('kid-account');

// One-call "act as the controlled account": get a ready Connection onto B.
const kidConn = await delegation.openControlled('kid-account');
const events = await kidConn.apiOne('events.get', { limit: 20 }, 'events');

// Create a brand-new controlled account, active at birth.
const created = await delegation.createAccount({
  username: 'kid-account',
  email: 'guardian+kid@example.com', // optional
  password: 'a-strong-password',     // optional (random if omitted)
  core: 'core-2'                     // optional target core (default: your own)
});
// created = { delegation: { relId, controlled: { username, hostSlug }, status: 'active', activatedAt }, apiEndpoint? }
```

`createAccount` with **no** `email`/`password` yields an account reachable only through delegates until a delegate sets a password.


## Detach requires a genuine login on B

`detachDelegate` and `cancelInvite` remove a delegation relationship, so they require the account owner to be **genuinely logged in** to the controlled account — a delegate PAT or a control token is rejected. A delegated session therefore cannot walk away with, or tear down, the relationship on its own.

The rejection surfaces as a typed [`DelegationError`](#typed-errors) with `id === delegationErrorIds.GENUINE_LOGIN_REQUIRED`. Surface it distinctly in your UI:

```js
const { errorIds: delegationErrorIds } = require('@pryv/delegation');

try {
  await delegation.detachDelegate('parent-b');
} catch (err) {
  if (err.id === delegationErrorIds.GENUINE_LOGIN_REQUIRED) {
    // Prompt the account owner to sign in directly (not via a delegated
    // session) before retrying the detach.
  } else {
    throw err;
  }
}
```


## Typed errors

When a `delegations.*` call rejects with a `delegation-*` id, the method throws a `DelegationError` whose `.id` is one of `errorIds` (a stable, kebab-case mirror of the server-side catalogue). Match on the constant instead of parsing `error.message`. Non-delegation errors (transport, validation, auth) propagate unchanged.

```js
const { DelegationError, errorIds } = require('@pryv/delegation');
```

| Constant | String | When |
|---|---|---|
| `GENUINE_LOGIN_REQUIRED` | `delegation-genuine-login-required` | `detachDelegate` / `cancelInvite` called without a genuine B login. |
| `NOT_ACTIVE` | `delegation-not-active` | `getToken` on a torn-down / non-active relationship (mirror flips to `stale`). |
| `NOT_FOUND` | `delegation-not-found` | No relationship for the given username. |
| `ALREADY_EXISTS` | `delegation-already-exists` | `requestAttach` duplicates an existing invite/relationship. |
| `UNKNOWN_USERNAME` | `delegation-unknown-username` | The target username does not resolve to an account. |
| `SELF_NOT_ALLOWED` | `delegation-self-not-allowed` | An account may not delegate to itself. |
| `INVITE_EXPIRED` | `delegation-invite-expired` | `acceptAttach` on an expired invite. |
| `USERNAME_TAKEN` | `delegation-username-taken` | `createAccount` username already claimed. |
| `UNKNOWN_CORE` | `delegation-unknown-core` | `createAccount` target `core` not known to the platform. |
| `CREATION_FAILED` | `delegation-creation-failed` | Account creation failed (rolled back). |
| `DELIVERY_FAILED` | `delegation-delivery-failed` | Cross-core delivery to the counterparty core failed. |
| `MIRROR_NOT_STALE` | `delegation-mirror-not-stale` | `dismissControlled` on a mirror that is not `stale`. |
| `PERSONAL_TOKEN_REQUIRED` | `delegation-personal-token-required` | A personal token was required but an app/shared token was used. |
| `DELEGATE_MISMATCH` | `delegation-delegate-mismatch` | Delegate identity does not match the recorded relationship. |

The `STATUS` export mirrors the relationship-status enum used in list entries: `STATUS.INVITE`, `STATUS.ACTIVE`, `STATUS.STALE`.


## Example

See [`examples/delegation-usage.js`](examples/delegation-usage.js) for a runnable end-to-end sample (parent creates a child account, mints a token, acts as the child, then detaches).


## Contributing

See the [Pryv JavaScript library README](https://github.com/pryv/lib-js#contributing)


## License

[BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
