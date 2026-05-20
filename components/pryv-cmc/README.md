# CMC client helpers for `pryv`

Cross-account Messaging & Consent (CMC) client-side helpers for the [Pryv JavaScript library](https://github.com/pryv/lib-js). CMC enables federated consent + chat + system notifications across two Pryv accounts (same or different platforms) via the open-pryv.io `cmc` plugin.


## Usage

`@pryv/cmc` is a **sibling package** to `pryv` — imported separately, not attached to the `pryv` namespace. It uses the standard `pryv.Connection` to talk to the server.


### Importing

#### NPM

`npm install --save pryv @pryv/cmc`, then in your code:

```js
const pryv = require('pryv');
const cmc = require('@pryv/cmc');
```

`@pryv/cmc` requires `pryv@^3.3.0` as a peer dependency.

#### `<script>` tag

`pryv-cmc.js` must be loaded **after** `pryv.js`. The package exposes its API on the global `pryvCmc`:

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
<script src="https://api.pryv.com/lib-js/pryv-cmc.js"></script>
<script>
  const cmc = window.pryvCmc;
</script>
```


### Surface

`@pryv/cmc` ships two layers:

- **Level 0** — pure helpers (constants, slug + stream-id builders, classifiers, `errorIds`). Used to construct or parse identifiers without a network call.
- **Level 1** — protocol functions taking a `pryv.Connection` and a parameters object. Each maps to one server-side CMC operation.


### Level 0 — constants + helpers

#### Namespace constants

- `cmc.NS` = `:_cmc:` — reserved root for the CMC stream tree.
- `cmc.NS_INBOX` = `:_cmc:inbox` — one-shot lifecycle stream (delivered events from peers).
- `cmc.NS_APPS` = `:_cmc:apps` — per-app scope root.
- `cmc.NS_INTERNAL` = `:_cmc:_internal` — plugin-private root.
- `cmc.NS_INTERNAL_RETRIES` = `:_cmc:_internal:retries` — retry queue stream.

#### Event types

`cmc.ET_REQUEST` (`consent/request-cmc`), `cmc.ET_ACCEPT` (`consent/accept-cmc`), `cmc.ET_REFUSE` (`consent/refuse-cmc`), `cmc.ET_REVOKE` (`consent/revoke-cmc`), `cmc.ET_INVALIDATE_LINK` (`consent/invalidate-link-cmc`), `cmc.ET_SCOPE_REQUEST` (`consent/scope-request-cmc`), `cmc.ET_SCOPE_UPDATE` (`consent/scope-update-cmc`), `cmc.ET_CHAT` (`message/chat-cmc`), `cmc.ET_SYSTEM_ALERT` (`notification/alert-cmc`), `cmc.ET_SYSTEM_ACK` (`notification/ack-cmc`).

Grouped collections: `cmc.EVENT_TYPES_LIFECYCLE`, `cmc.EVENT_TYPES_CHAT`, `cmc.EVENT_TYPES_SYSTEM`.

#### Slug + stream-id builders

```js
cmc.slugifyHost('pryv.me');                                     // → 'pryv-me'
cmc.counterpartySlug({ username: 'alice', host: 'pryv.me' });   // → 'alice--pryv-me'
cmc.parseCounterpartySlug('alice--pryv-me');                    // → { username: 'alice', hostSlug: 'pryv-me' }

cmc.appScope('my-app');                                         // → ':_cmc:apps:my-app'
cmc.chatStreamUnder(':_cmc:apps:my-app', 'alice--pryv-me');     // → ':_cmc:apps:my-app:chats:alice--pryv-me'
cmc.collectorStreamUnder(':_cmc:apps:my-app', 'alice--pryv-me');// → ':_cmc:apps:my-app:collectors:alice--pryv-me'
```

`cmc.SEPARATOR` is `--`.

#### Classifiers + parsers

```js
cmc.isCmcStreamId(':_cmc:apps:my-app');                  // → true
cmc.isAppNestedPluginStream(':_cmc:apps:my-app:chats:s'); // → true
cmc.getAppCode(':_cmc:apps:my-app:study-1');              // → 'my-app'
cmc.parseChatStreamId(':_cmc:apps:my-app:chats:a--p-me'); // → { appCode, scopeStreamId, counterpartySlug, counterparty }
cmc.parseCollectorStreamId(...);                          // → { ... } same shape
```

#### Error id catalogue

`cmc.errorIds` mirrors the server-side `CmcErrorIds` catalogue (31 stable kebab-case strings as of `@pryv/cmc@1.1.0`). Match on these constants when observing `trigger.content.failure.reason` or `error.data.id` from a failed `events.create` / `accesses.create` instead of parsing English `error.message`.

Lifecycle / handler / chat-routing examples: `cmc.errorIds.CAPABILITY_INVALID` (`'cmc-capability-invalid'`), `cmc.errorIds.CAPABILITY_CONSUMED`, `cmc.errorIds.CAPABILITY_INVALIDATED`, `cmc.errorIds.CAPABILITY_ALREADY_ACCEPTED_BY_YOU`, `cmc.errorIds.HANDLER_DELIVERY_FAILED`, `cmc.errorIds.CHAT_NO_REMOTE_APIENDPOINT`, etc.

**Added in `@pryv/cmc@1.1.0`** (server-side `open-pryv.io` ≥ 2.0.0-pre.4):

| Const | String | When you'll see it |
|---|---|---|
| `CAPABILITY_TTL_OUT_OF_RANGE` | `'cmc-capability-ttl-out-of-range'` | `createInvite({ expiresAt })` resolves to a TTL outside `[60s, 30d]`. Omit `expiresAt` to use the 7-day default. |
| `HANDLER_MISSING_CAPABILITY_ID` | `'cmc-handler-missing-capability-id'` | Plugin handler couldn't find `content.capabilityId` on the trigger event. |
| `CHAT_DISABLED` | `'cmc-chat-disabled'` | `sendChat` against a relationship whose negotiated `features.chat: false`. Default-permit on omission. |
| `SYSTEM_MESSAGING_DISABLED` | `'cmc-system-messaging-disabled'` | `sendSystemAlert` / ack against `features.systemMessaging: false`. Scope-request / scope-update remain permitted regardless. |
| `CLIENTDATA_CMC_FORBIDDEN` | `'cmc-clientdata-cmc-forbidden'` | `accesses.create` / `accesses.update` rejected user-supplied `clientData.cmc.*` (the namespace is plugin-owned). |
| `RESERVED_STREAM_UNDELETABLE` | `'cmc-reserved-stream-undeletable'` | `streams.delete` rejected on a plugin-managed `:_cmc:*` parent (incl. personal-token deletes). |
| `COUNTERPARTY_IDENTITY_MISSING` | `'cmc-counterparty-identity-missing'` | Peer-side `content.from` stamping hook rejected — the counterparty access lacks `{username,host}` (ops-level, shouldn't happen under normal flow). |

The full list lives in [`src/index.js`](src/index.js) (and the typed mirror in [`src/index.d.ts`](src/index.d.ts)).

`cmc.CmcError` is a typed `Error` subclass carrying `.id` (one of `errorIds.*`) and `.failure` (the server's raw `failure` object). It's thrown by `acceptInvite` on `status: 'failed'`.

#### Capability TTL bounds

The server bounds `content.request.expiresAt` (Unix seconds) to `[60s, 30d]` from now at mint time. Pass `expiresAt` to `cmc.createInvite()` to override the default 7-day lifetime; omit it for the default. Out-of-range values reject with `cmc-capability-ttl-out-of-range` before the capability access is minted.

#### Features negotiation

`cmc.createInvite({ features: { chat, systemMessaging } })` opts the relationship in or out of each cross-account channel.

- **Both default to `true`** when the key is omitted (matches the offer-side default).
- Setting either to `false` is **binding on both sides at send time** — the recipient's plugin records the negotiation on the counterparty access's `clientData.cmc.features.*`, and subsequent `sendChat` / `sendSystemAlert` against the access reject with `cmc-chat-disabled` / `cmc-system-messaging-disabled` until a new invite negotiates it back on.
- `cmc.scopes.{inbox, chats, collectors}` and `cmc.revokeRelationship` are unaffected — those are protocol surfaces, not message channels.

#### `pryv.utils.decomposeAPIEndpoint`

The companion `pryv.utils.decomposeAPIEndpoint(apiEndpoint, serviceInfoApi)` returns `{ token, username, host }` with `host` being the **canonical platform host** (no `<username>.` subdomain prefix). It's the right way to derive the `{ username, host }` arguments for `cmc.counterpartySlug`. It lives in `pryv.utils` (not `cmc.*`) because it's generally useful — see the [pryv README](../pryv#readme).


### Level 1 — protocol functions

Each function takes a `pryv.Connection` and a parameters object. All return Promises. The full TypeScript signatures live in [`src/index.d.ts`](src/index.d.ts).

#### Provider side (the requester)

```js
const invite = await cmc.createInvite(conn, {
  appCode: 'my-app',
  scopeStreamId: ':_cmc:apps:my-app:study-1',
  displayName: 'Dr. Alice',
  requestedPermissions: [{ streamId: 'fertility', level: 'read' }],
  mode: 'single-use',            // or 'open-link'
  consent: { en: 'I consent to share data for this study.' },
  features: { chat: true, systemMessaging: true }
});
// invite = { inviteEventId, capabilityUrl, mode, expiresAt }

const arrived = await cmc.waitForAccept(conn, {
  fromUsername: 'bob',           // identify the expected accepter
  appCode: 'my-app',
  timeoutMs: 15000
});
// arrived = { acceptInboxEventId, grantedAccessApiEndpoint, counterparty, features }
// grantedAccessApiEndpoint is the data-grant access on bob's account —
// use it to query bob's data.

await cmc.revokeRelationship(conn, {
  inviteEventId: invite.inviteEventId,     // OR pass { accessId, scopeStreamId } directly
  reason: { en: 'study completed' }
});

// Open-link mode only (Phase 2 lifecycle):
await cmc.invalidateCapability(conn, {
  inviteEventId: invite.inviteEventId,
  reason: { en: 'study cohort closed' }
});

const list = await cmc.listInvites(conn, { appCode: 'my-app', limit: 1000 });
// list = { items: InviteRecord[], truncated: boolean }

const one = await cmc.getInviteStatus(conn, invite.inviteEventId);

const update = await cmc.requestScopeUpdate(conn, {
  collectorStreamId: ':_cmc:apps:my-app:collectors:bob--pryv-me',
  newPermissions: [{ streamId: 'fertility', level: 'read' }, { streamId: 'cycle', level: 'read' }],
  message: { en: 'Adding cycle stream for sub-study.' }
});
// update = { scopeRequestEventId }
```

#### Consumer side (the accepter)

```js
const offer = await cmc.readOffer(capabilityUrl);
// offer = { requester: { username, host, displayName }, consent, requestedPermissions, mode, features }

const accepted = await cmc.acceptInvite(conn, capabilityUrl, {
  scopeStreamId: ':_cmc:apps:my-app',      // REQUIRED — own scope stream where the trigger lands.
  extra: { chat: true, systemMessaging: true },
  accessName: 'my-app-grant'
});
// accepted = { acceptEventId, dataGrantAccessId, counterparty, features }
// Waits for Phase-2 completion by default (~50-200ms).
// Pass `waitForCompletion: false` to return immediately as { ..., status: 'pending' }.

await cmc.refuseInvite(conn, capabilityUrl, {
  scopeStreamId: ':_cmc:apps:my-app',
  reason: { en: 'not interested' }
});

await cmc.revokeAcceptance(conn, {
  scopeStreamId: ':_cmc:apps:my-app',
  accessId: accepted.dataGrantAccessId,
  reason: { en: 'opting out' }
});

const relationships = await cmc.listAcceptedRelationships(conn, { appCode: 'my-app' });
// relationships = RelationshipRecord[]

// Respond to a scope-update request from the provider:
await cmc.acceptScopeUpdate(conn, scopeRequestEventId);
await cmc.refuseScopeUpdate(conn, scopeRequestEventId, { reason: { en: 'no thanks' } });
```

#### Cross-direction (chat, system messages)

```js
await cmc.sendChat(conn, {
  scopeStreamId: ':_cmc:apps:my-app',
  peerSlug: cmc.counterpartySlug({ username: 'bob', host: 'pryv.me' }),
  content: 'Hello Bob.'
});
// Schema: { content: string } (1-10240 chars per data-types/message.json#chat-cmc).

await cmc.sendSystemAlert(conn, {
  scopeStreamId: ':_cmc:apps:my-app',
  peerSlug,
  level: 'warning',
  title: { en: 'Battery low' },
  body: { en: 'Charge device before next sync.' },
  ackRequired: true,
  ackId: 'BAT-001'
});

await cmc.sendSystemAck(conn, {
  scopeStreamId: ':_cmc:apps:my-app',
  peerSlug,
  alertEventId,
  ackId: 'BAT-001'
});
```

#### Observation scopes

Use these helpers to build the Monitor scope for the add-on [`@pryv/monitor`](https://github.com/pryv/lib-js/tree/master/components/pryv-monitor#readme):

```js
const inboxScope = cmc.scopes.inbox();
// → { streams: [':_cmc:inbox'] }
const chatsScope = cmc.scopes.chats({ appCode: 'my-app' });
// → { streams: [':_cmc:apps:my-app:chats'] } (recursive)
const peerScope = cmc.scopes.chats({ appCode: 'my-app', peerSlug: 'bob--pryv-me' });
// → { streams: [':_cmc:apps:my-app:chats:bob--pryv-me'] } (narrowed)
const collectorsScope = cmc.scopes.collectors({ appCode: 'my-app', peerSlug });
```

Plug them into a `pryv.Monitor` to receive live updates:

```js
const monitor = new pryv.Monitor(conn, cmc.scopes.inbox())
  .on('event', (event) => {
    if (event.type === cmc.ET_ACCEPT) { /* a peer accepted */ }
    if (event.type === cmc.ET_REVOKE) { /* a peer revoked */ }
  });
await monitor.start();
```


### Examples

#### Full handshake (provider → consumer)

```js
const pryv = require('pryv');
const cmc = require('@pryv/cmc');

const provider = new pryv.Connection('https://t0kP@alice.pryv.me/');
const consumer = new pryv.Connection('https://t0kC@bob.pryv.me/');

// Alice issues an invite.
const invite = await cmc.createInvite(provider, {
  appCode: 'my-app',
  scopeStreamId: ':_cmc:apps:my-app:study-1',
  displayName: 'Dr. Alice',
  requestedPermissions: [{ streamId: 'fertility', level: 'read' }],
  consent: { en: 'I consent to share fertility data for this study.' },
  features: { chat: true }
});

// (Share invite.capabilityUrl with Bob out-of-band — QR / link / email.)

// Bob accepts.
const accepted = await cmc.acceptInvite(consumer, invite.capabilityUrl, {
  scopeStreamId: ':_cmc:apps:my-app',
  extra: { chat: true }
});

// Alice waits for Bob's accept arrival + reads Bob's data.
const arrived = await cmc.waitForAccept(provider, {
  fromUsername: accepted.counterparty.username,
  appCode: 'my-app'
});
const peerConn = new pryv.Connection(arrived.grantedAccessApiEndpoint);
const data = await peerConn.api([{ method: 'events.get', params: { streams: ['fertility'], limit: 100 } }]);
```


### Known limitation — `waitForAccept` identification

The accept arrival on `:_cmc:inbox` does **not** carry the requester's `inviteEventId` (the server-side `originalEventId` field is the capability-internal offer event id, not the trigger). `cmc.waitForAccept` therefore matches by `from.{username, host}` + `requesterAppCode` instead. If you don't know the accepter's username ahead of time (e.g. open-link mode where anyone with the URL may accept), poll the inbox yourself using `events.get` with `streams: [cmc.NS_INBOX]` and filter on what you do know.


## Contributing

See the [Pryv JavaScript library README](https://github.com/pryv/lib-js#contributing)


## License

[BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
