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

`cmc.errorIds` mirrors the server-side `CmcErrorIds` catalogue (see the table and the 3.21.0 addendum below). Match on these constants when observing `trigger.content.failure.reason` or `error.data.id` from a failed `events.create` / `accesses.create` instead of parsing English `error.message`.

Lifecycle / handler / chat-routing examples: `cmc.errorIds.CAPABILITY_INVALID` (`'cmc-capability-invalid'`), `cmc.errorIds.CAPABILITY_CONSUMED`, `cmc.errorIds.CAPABILITY_INVALIDATED`, `cmc.errorIds.CAPABILITY_ALREADY_ACCEPTED_BY_YOU`, `cmc.errorIds.HANDLER_DELIVERY_FAILED`, `cmc.errorIds.CHAT_NO_REMOTE_APIENDPOINT`, etc.

**Added in `@pryv/cmc@1.1.0`** (server-side `open-pryv.io` ≥ 2.0.0-pre.4):

| Const | String | When you'll see it |
|---|---|---|
| `CAPABILITY_TTL_OUT_OF_RANGE` | `'cmc-capability-ttl-out-of-range'` | `createInvite({ expiresAt })` resolves outside the bounds for the mode: `[60s, 30d]` single-use; at least 60s, no upper bound, open-link. Omit `expiresAt` to use the 7-day default. |
| `CAPABILITY_NO_EXPIRY_NOT_ALLOWED` | `'cmc-capability-no-expiry-not-allowed'` | `createInvite({ expiresAt: null })` without `mode: 'open-link'`. Thrown client-side before anything is written; the server refuses it too. |
| `HANDLER_MISSING_CAPABILITY_ID` | `'cmc-handler-missing-capability-id'` | Plugin handler couldn't find `content.capabilityId` on the trigger event. |
| `CHAT_DISABLED` | `'cmc-chat-disabled'` | `sendChat` against a relationship whose negotiated `features.chat: false` and which still has a chat stream (accepted before open-pryv.io 2.0.0-rc.38; later ones have no chat stream, see Features negotiation). Default-permit on omission. |
| `SYSTEM_MESSAGING_DISABLED` | `'cmc-system-messaging-disabled'` | `sendSystemAlert` / ack against `features.systemMessaging: false`. Scope-request / scope-update remain permitted regardless. |
| `SELF_ACCEPT_FORBIDDEN` | `'cmc-self-accept-forbidden'` | `acceptInvite` with the account that made the offer (an open link opened while signed in as the requester). Refused by open-pryv.io 2.0.0-rc.38 and later before anything is provisioned. |
| `CLIENTDATA_CMC_FORBIDDEN` | `'cmc-clientdata-cmc-forbidden'` | `accesses.create` / `accesses.update` rejected user-supplied `clientData.cmc.*` (the namespace is plugin-owned). |
| `RESERVED_STREAM_UNDELETABLE` | `'cmc-reserved-stream-undeletable'` | `streams.delete` rejected on a plugin-managed `:_cmc:*` parent (incl. personal-token deletes). |
| `COUNTERPARTY_IDENTITY_MISSING` | `'cmc-counterparty-identity-missing'` | Peer-side `content.from` stamping hook rejected — the counterparty access lacks `{username,host}` (ops-level, shouldn't happen under normal flow). |

**Added in `@pryv/cmc@3.21.0`** for [group membership](#group-accounts-membership): refused when the trigger is written (`error.data.id`) `MEMBER_ACCESS_NOT_MEMBER`, `MEMBER_ACCESS_RELATIONSHIP_NOT_FOUND`, `MEMBER_ACCESS_SCOPE_OUTSIDE_MEMBERSHIP`, `MEMBER_ACCESS_PERMISSIONS_NOT_SUBSET`, `MEMBER_ACCESS_EXPIRY_OUT_OF_RANGE`, `MEMBER_ACCESS_RATE_LIMITED`, `MEMBER_ACCESS_IN_FLIGHT`, `MEMBERSHIP_PERMISSIONS_INVALID`, `MEMBER_STAMP_INVALID`; recorded on the trigger (`failure.reason`) `MEMBER_ACCESS_GRANT_NOT_DELEGABLE`, `MEMBER_ACCESS_PEER_REJECTED`, `MEMBER_ACCESS_PEER_UNREACHABLE`, `MEMBER_ACCESS_MEMBERSHIP_GONE`, `MEMBER_ACCESS_NOT_RETRYABLE`, `MEMBER_REVOKE_RESIDUAL`, `MEMBER_CHANNEL_NOT_SUPPORTED`. Three are produced by this package only, never by a server: `MEMBER_ACCESS_UNSUPPORTED` (`'cmc-member-access-unsupported'`, the group's core answered without an access), `MEMBER_ACCESS_TOKEN_MISSING` (`'cmc-member-access-token-missing'`, the access was created but the answer arrived without its token) and `MEMBERSHIP_OFFER_EXPECTED` (`'cmc-membership-offer-expected'`, `acceptMembership` given an ordinary offer). Also added: `OFFER_STREAM_NOT_OFFERABLE` (`'cmc-offer-stream-not-offerable'`, on the accept trigger: an offer asks a stream the server manages on the accepter's account: the inbox, the internal subtree, a chats / collectors leaf, the `:_cmc:apps` root; refused at write too, as `cmc-invalid-event-content`; not the same id as `OFFER_INVALID_PERMISSIONS`) and `INVALIDATE_LINK_SCOPE_MISMATCH` (`'cmc-invalidate-link-scope-mismatch'`, `consent/invalidate-link-cmc` written on a stream that does not hold the invite it names).

The full list lives in [`src/index.js`](src/index.js) (and the typed mirror in [`src/index.d.ts`](src/index.d.ts)).

`cmc.CmcError` is a typed `Error` subclass carrying `.id` (one of `errorIds.*`) and `.cause` (the server's raw `failure` object, or the API error it wraps). It's thrown by `acceptInvite` on `status: 'failed'` and by the membership helpers below.

#### Capability TTL bounds

The server validates `content.request.expiresAt` (Unix seconds) at mint time: a single-use invite must resolve to `[60s, 30d]` from now, an open-link invite to at least 60s with no upper bound. Pass `expiresAt` to `cmc.createInvite()` to override the default 7-day lifetime; omit it for the default. Out-of-bounds values reject with `cmc-capability-ttl-out-of-range` before the capability access is minted (the error data carries `mode` and `maxTtlSeconds`, `null` for open-link).

Open-link invites may pass `expiresAt: null` for a link without expiry (for example a registration link published on a website); the link then works until `cmc.invalidateCapability()` and the result's `expiresAt` is `null`. `null` with `mode: 'single-use'` throws `cmc-capability-no-expiry-not-allowed` client-side.

Against a core that predates these rules: `null` is minted with the 7-day default and the result carries a number, so check `expiresAt === null` when you rely on it; an open-link `expiresAt` beyond 30 days is refused with `cmc-capability-ttl-out-of-range` and `maxTtlSeconds: 2592000`. A core whose event-types catalogue predates 1.1.2 refuses `null` before the CMC plugin sees it, with `invalid-parameters-format` at `#/request/expiresAt`.

#### Features negotiation

`cmc.createInvite({ features: { chat, systemMessaging } })` opts the relationship in or out of each cross-account channel.

- **Both default to `true`** when the key is omitted (matches the offer-side default).
- **The server resolves them from the offer** (open-pryv.io 2.0.0-rc.38 and later): the accept may only narrow them, never turn on a feature the offer turned off. The resolved pair is stamped on the accept event, on both relationship accesses (`clientData.cmc.features`) and on the requester's inbox mirror. Read `features` there, not the existence of a chat stream, to decide whether to offer chat.
- **A relationship without chat has no chat channel**: no `chats:<counterparty-slug>` stream and no chat permission on either side (the `chats` parent stays). `sendChat` on it fails with `unknown-referenced-resource` (the chat stream does not exist), and a counterparty writing a `message/chat-cmc` directly is refused with HTTP 403, `data.id: 'cmc-chat-disabled'`.
- **Relationships accepted before that release** keep their chat stream; on them `sendChat` / `sendSystemAlert` reject with `cmc-chat-disabled` / `cmc-system-messaging-disabled` when the recorded value is `false`, and the server refuses a direct write the same way. A new invite is needed to turn a feature back on.
- `cmc.scopes.{inbox, chats, collectors}` and `cmc.revokeRelationship` are unaffected: those are protocol surfaces, not message channels.

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
  // allowUserChoice: true,      // the accepter may grant a subset (default: all or nothing)
  // accessType: 'app',          // delegable grant: you may create sub-accesses from it
});
// invite = { inviteEventId, capabilityUrl, mode, expiresAt (number | null) }

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
// one.status: 'pending' | 'delivered' (open), 'accepted' / 'refused' / 'revoked'
// (single-use, with one.counterparty and one.backChannelAccessId once accepted),
// 'invalidated' (open-link), or 'expired' (derived). A refused single-use invite
// may still be accepted later.

const joined = await cmc.listInviteAccepters(conn, { inviteEventId: invite.inviteEventId });
// joined = { items: [{ username, host, acceptedAt, backChannelAccessId, scopeStreamId }] }
// Who is currently joined (both modes); a revoked relationship drops out.

const update = await cmc.proposeScopeUpdate(conn, {
  collectorStreamId: ':_cmc:apps:my-app:collectors:bob--pryv-me',
  newPermissions: [{ streamId: 'fertility', level: 'read' }, { streamId: 'cycle', level: 'read' }],
  message: { en: 'Adding cycle stream for sub-study.' }
});
// update = { scopeRequestEventId, remoteScopeRequestEventId, status }
// Waits for delivery by default (`waitForDelivery: false` to skip).
// ⚑ Hand `remoteScopeRequestEventId` to the user side (acceptScopeUpdate or the
// /cmc-scope-update hand-off): it is the request's id on the USER's account.
// `scopeRequestEventId` is your own trigger and cannot be answered.
// (renamed in 3.9.0 from `requestScopeUpdate` — that name now refers to
//  the user-side accept hand-off helper. Old name removed; importers
//  must use `proposeScopeUpdate`.)
```

#### Consumer side (the accepter)

> **Token class.** `consent/accept-cmc` and `consent/scope-update-cmc` writes require a **personal** access token server-side (Pryv.io rejects app/shared tokens with `400 invalid-operation` + `error.data.id === 'cmc-accept-requires-personal-token'`). If your app holds only an app/shared token, use the [accept hand-off helpers](#accept-hand-off-app-without-a-personal-token) instead of calling `acceptInvite` / `acceptScopeUpdate` directly.
>
> **Revoke uses the standard access-permission gate, not the personal-token gate.** `consent/revoke-cmc` is checked against `AccessLogic.canDeleteAccess` (which honours the `selfRevoke` feature permission on the target access). Apps holding a relationship's data-grant access can self-revoke directly via `cmc.revokeAcceptance(...)` / `cmc.revokeRelationship(...)` — no hand-off needed. The server rejects unauthorised revokes with `error.data.id === 'cmc-revoke-forbidden'`.

```js
const offer = await cmc.readOffer(capabilityUrl);
// offer = { requester: { username, host, displayName }, consent, requestedPermissions,
//           allowUserChoice, accessType, membership, mode, features }
// accessType 'app': the grant is delegable (the requester can create sub-accesses
// from it, for example for the members of a group); say so on the consent screen.
// membership true: the requester asks to join YOUR group (see acceptMembership).

const accepted = await cmc.acceptInvite(conn, capabilityUrl, {
  scopeStreamId: ':_cmc:apps:my-app',      // REQUIRED — own scope stream where the trigger lands.
  extra: { chat: true, systemMessaging: true },
  accessName: 'my-app-grant'
  // grantedPermissions: [...]             // a subset of the offer, when offer.allowUserChoice
});
// accepted = { acceptEventId, dataGrantAccessId, counterparty, features }
// Waits for Phase-2 completion by default (~50-200ms).
// Pass `waitForCompletion: false` to return immediately as { ..., status: 'pending' }.
// Requires `conn` to be authenticated with a personal token (see hand-off helpers below).

await cmc.refuseInvite(conn, capabilityUrl, {
  scopeStreamId: ':_cmc:apps:my-app',
  reason: { en: 'not interested' }
});

await cmc.revokeAcceptance(conn, {
  scopeStreamId: ':_cmc:apps:my-app',
  accessId: accepted.dataGrantAccessId,
  reason: { en: 'opting out' }
});

const relationships = await cmc.listAcceptedRelationships(conn, { scopeStreamId: cmc.appScope('my-app') });
// relationships = RelationshipRecord[]
// Active relationships only: an accept event whose `content.withdrawal` is set
// (the relationship ended: data grant deleted, revoked by either side, delegation
// detached) is left out. Pass `includeWithdrawn: true` to list those too, each with
// `withdrawal = { at, by, accessId?, revokeEventId?, relId? }` (null while active).
// Needs a core that records withdrawals; an older core leaves ended ones looking active.

// Respond to a scope-update request from the provider. The id is the
// request's id on YOUR account (the provider gets it as remoteScopeRequestEventId).
const granted = await cmc.acceptScopeUpdate(conn, scopeRequestEventId);
// granted = { updateAcceptEventId, dataGrantAccessId, newPermissions, status, peerNotified }
// Resolves only once the server APPLIED the request's permissions to the grant;
// throws CmcError otherwise (err.id: 'cmc-scope-request-not-found', ...,
// or 'cmc-scope-update-not-applied' against a server that does not apply them).
// peerNotified: false = the grant changed but the provider could not be told yet.
// Waits up to 20 s by default (the core's own delivery attempt takes up to 15 s).
// err.id 'cmc-scope-update-outcome-unknown' = the wait ended before the core
// recorded an outcome: not a failure, do not answer again.
await cmc.refuseScopeUpdate(conn, scopeRequestEventId, { reason: { en: 'no thanks' } });
```

#### Accept hand-off (app without a personal token)

`acceptInvite` and `acceptScopeUpdate` post triggers that the server gates to **personal tokens only**. If your app holds only an app/shared access, hand the user off to app-web-user-account's `/cmc-accept` or `/cmc-scope-update` page: the user authenticates with their own credentials, the page writes the trigger with the fresh personal token, and the result is returned to your app via popup `postMessage` or `returnUrl` redirect.

Revoke does NOT need a hand-off — `cmc.revokeAcceptance` / `cmc.revokeRelationship` go through the standard `AccessLogic.canDeleteAccess` rule (which honours the `selfRevoke` feature permission on the target). Apps holding the relationship's data-grant access can self-revoke from any token class.

Two helper pairs, both ship in `@pryv/cmc@3.9`:

```js
// 1. URL only (caller drives navigation — custom popup, mobile deep-link, …).
const url = cmc.requestAcceptUrl({
  authUrl: 'https://account.pryv.me/cmc-accept',          // /cmc-accept route on the deployed app-web-user-account
  pryvApi: 'https://reg.pryv.me/',                        // recipient's Pryv API base
  capabilityUrl,                                           // from the requester's invite (out-of-band)
  scopeStreamId: ':_cmc:apps:my-app',                     // recipient's own :_cmc:apps:* stream
  accessName: 'my-app-grant'                              // optional
  // returnUrl: 'https://app.example.com/accepted'         // switches to redirect mode
});

// 2. Popup + postMessage (browser-only).
const result = await cmc.requestAccept({
  authUrl,
  pryvApi,
  capabilityUrl,
  scopeStreamId: ':_cmc:apps:my-app',
  // mode: 'popup' is the default. timeoutMs default: 10 min.
  expectedOrigin: 'https://account.example.com'     // recommended: the account app's origin
});
// result = { ok: true, acceptEventId }
// Only a message posted by the popup this call opened is trusted (`ev.source`);
// messages from any other window or frame are ignored. The origin is not compared
// to authUrl by default, since the account app may redirect to another origin.
// The source check proves which window posted, not what it currently displays (a
// popup navigated to hostile content, or a hostile frame opening the same window
// name `cmcAccept`, still passes), so set expectedOrigin whenever the account
// app's origin is known. Any absolute URL works (reduced to its origin: case,
// trailing slash and default port do not matter); an unparsable value rejects
// with CmcError id 'cmc-invalid-expected-origin'.
// Rejects with CmcError (id: 'cmc-accept-popup-closed' | 'cmc-accept-popup-blocked'
// | 'cmc-accept-timeout' | the server's `failure.reason` on ok:false).

// Or redirect mode (full-page navigation; the page returns by re-navigating to returnUrl):
await cmc.requestAccept({
  authUrl, pryvApi, capabilityUrl, scopeStreamId: ':_cmc:apps:my-app',
  returnUrl: 'https://app.example.com/accepted'   // → location.assign(returnUrl?cmcAcceptResult=<json>)
});
```

> **The platform may restrict redirect mode.** Since app-web-user-account 0.18.0, an operator can set a
> `returnPolicy` deciding which `returnUrl` origins `/cmc-accept` and `/cmc-scope-update` go back to by
> themselves; for another origin the page may show a "Return to {host}" link the user clicks (same
> result in the query), or only the outcome. Without a policy every http(s) `returnUrl` is followed.
> If you use redirect mode on such a platform, ask the operator to list your app's origin, or use popup
> mode, which the policy does not affect.

Scope-update hand-off (same shape, different page):

```js
// Browser flow — open the auth page and wait for the user to accept / refuse.
const result = await cmc.requestScopeUpdate({
  authUrl: 'https://account.pryv.me/cmc-scope-update',          // /cmc-scope-update route
  pryvApi: 'https://reg.pryv.me/',
  scopeRequestEventId: update.remoteScopeRequestEventId,        // the request's id on the USER's account
  // scopeStreamId is optional — defaults to the scope-request event's home stream
});
// result = { ok: true, updateEventId, action: 'accept' | 'refuse', peerNotified? }
// Same popup contract as requestAccept: only the opened popup's message is trusted,
// with the same residual risk (window name `cmcScopeUpdate`); set expectedOrigin
// whenever the account app's origin is known.
// Rejects with CmcError (id: 'cmc-scope-update-popup-closed' | 'cmc-scope-update-popup-blocked'
// | 'cmc-scope-update-timeout' | the server's `failure.reason` on ok:false).

// URL-only (caller drives navigation):
const url = cmc.requestScopeUpdateUrl({
  authUrl, pryvApi, scopeRequestEventId, returnUrl: 'https://app.example.com/done'
});
```

The `/cmc-accept` page is part of [app-web-user-account](https://github.com/pryv/app-web-user-account); operators serving Pryv.io's auth pages get it automatically. The result payload (popup or redirect) carries `{ type: 'cmc-accept-result', ok, acceptEventId }` on success and `{ ..., ok: false, reason }` on failure. It carries no data-grant endpoint: the accepter's accept record is stored without the access token, so no accepter-side result can hold one.

`acceptEventId` (and `dataGrantAccessId` from `acceptInvite`) are ids on the accepter's account. The requester's handle on the accept is the inbox arrival: call `waitForAccept` on the requester's connection to get `acceptInboxEventId` and `grantedAccessApiEndpoint`, the endpoint of the data grant.

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

#### Handling a revocation arrival

A revoke event's `content.accessId` is the **withdrawing side's** access id on
their own account, so it matches nothing locally. `cmc.revocationFromEvent`
normalizes the arrival onto the handles this account holds, and
`cmc.revocationMatches` tells you whether it concerns a relationship you are
tracking:

```js
const rev = cmc.revocationFromEvent(event);
// rev.side          'requester' | 'accepter' | null (older server)
// rev.localAccessId the access on THIS account that served the relationship
// rev.inviteEventId / offerEventId / acceptEventId / scopeStreamId
// rev.revokedAccessIds  local accesses the server already deleted
// rev.peerAccessId  their id, surfaced but not a local handle
// rev.revokedAt     when the withdrawing side issued it (seconds; null from an older peer)
// rev.superseded    'relationship-re-established' when the notice was dropped as stale, else null

if (rev.superseded != null) return;   // informational: keep your endpoints

// Match on the PER-RELATIONSHIP handle you stored when the accept arrived:
if (cmc.revocationMatches(rev, { accessId: relationship.backChannelAccessId })) {
  dropCachedEndpointsFor(relationship);   // those tokens are already dead
}
```

The accesses in `revokedAccessIds` are deleted by the server before the event is
readable, so there is nothing to `accesses.delete` yourself: drop the cached
endpoints instead. A notice the sender's server re-sent late can arrive after
the two parties accepted again: the receiving server records it but tears
nothing down when it names an earlier accept than the current one, marks the
arrival `content.superseded: 'relationship-re-established'` (surfaced as
`rev.superseded`), and keeps accesses created after `revokedAt`. Ignore a
superseded arrival: keep the endpoints you hold and do not present the
relationship as withdrawn (`revocationMatches` returns false for it). Otherwise
act on `revokedAccessIds`, not on the arrival alone.

**Match on the narrowest handle you have.** `revocationMatches` lets the most
specific identifier the two sides share decide, and does not fall through past
it: `accessId` → `acceptEventId` → `offerEventId` → `inviteEventId` →
`scopeStreamId`. This matters on an **open (multi-use) invite link**, where
every accepter's relationship carries the same `inviteEventId` and the same
`scopeStreamId` — those name the *link*, not the subject. Matching a revocation
on `inviteEventId` alone would therefore hit every other subject of the same
study. Either pass the `accessId` you stored per relationship, or add the peer
as a filter:

```js
cmc.revocationMatches(rev, { inviteEventId, from: rev.from && relationship.peer });
```

`from` is a filter rather than a match: a different peer returns false before
anything else is considered, and agreeing alone never proves a match. It is safe
to trust because the server stamps `from` on every inbox arrival.

Against a server that predates the receiver-side enrichment, `side` and
`localAccessId` are `null`, and the record carries only what that older server
sent — often just the peer's own `accessId` and `appCode`. There may then be no
shared identifier at all and `revocationMatches` returns false for everything;
fall back to `rev.from` plus your own bookkeeping.

#### Group accounts (membership)

A group (a practice, a research team) is an ordinary Pryv account. Its members
are other Pryv accounts: each joins with a membership, a CMC relationship in
which the member asks and a group administrator accepts, so the member holds an
access on the group's account. Members invite patients on the group's behalf
and read a patient's data under an access that names them, created by the
group's core; no backend is needed on the implementer's side. Requires cores
that support group membership on both the group's and the patients' side.

**Member side**

```js
const member = new pryv.Connection(memberApiEndpoint);   // the member's own account
const group = { username: 'practice', host: 'pryv.me' };

// 1. Ask to join: contribute on the group's team streams.
const request = await cmc.requestMembership(member, {
  group,
  scopeStreamIds: [':_cmc:apps:practice:team-a'],   // streams on the GROUP's account
  appCode: 'practice',
  displayName: 'Dr. Who'                            // how the administrator sees you
});
// request = { inviteEventId, capabilityUrl, mode: 'single-use', expiresAt, group }
// Show request.capabilityUrl as a QR code or a link to an administrator: nothing
// is delivered to the group automatically.

// 2. Wait for the administrator (a human: use a long timeout, or call again).
const joined = await cmc.waitForMembership(member, { group, appCode: 'practice', timeoutMs: 10 * 60 * 1000 });
const membership = new pryv.Connection(joined.membershipApiEndpoint);   // your access on the group's account
// Only an acceptance from `group` counts; anyone else accepting the link is ignored.
// When the arrival carries the server's `membership` marker, it must be true.

// 3. Invite a patient on the group's behalf. The grant must be delegable.
const invite = await cmc.createInvite(membership, {
  appCode: 'practice',
  scopeStreamId: ':_cmc:apps:practice:team-a',
  displayName: 'Practice',
  requestedPermissions: [{ streamId: 'diary', level: 'read' }],
  accessType: 'app'
});

// 4. Once the patient accepted: get an access on the patient's account.
try {
  const access = await cmc.requestMemberAccess(membership, {
    counterparty: { username: 'patient', host: 'pryv.me' },
    scopeStreamId: ':_cmc:apps:practice:team-a'      // the patient relationship's scope
    // permissions: [{ streamId: 'diary', level: 'read' }],   // default: the offer's streams at read
    // expireAfter: 3600                                     // seconds; default 24 h, at most 7 days
  });
  // access = { triggerEventId, apiEndpoint, accessId, name, expires, attribution }
  const patient = new pryv.Connection(access.apiEndpoint);
} catch (err) {
  if (cmc.isMemberAccessRetryable(err)) { /* in flight or patient core unreachable: ask again shortly */ }
  // err.id: cmc.errorIds.MEMBER_ACCESS_* (see the catalogue above)
  // A refusal at write keeps the server's error.data on err.cause.innerObject.data:
  // MEMBER_ACCESS_RELATIONSHIP_NOT_FOUND with data.reason === 'offer-not-found'
  // means the group's invite to that patient was deleted: invite the patient again.
}

// 5. Leave the group: the group's core deletes the accesses it created for you.
await cmc.leaveMembership(member, { inviteEventId: request.inviteEventId });
// Before the administrator accepted there is nothing to leave: this throws
// cmc-capability-invalid, and the unaccepted request simply expires.
```

`requestMemberAccess` is answered synchronously: the group's core creates the
access on the patient's account through the patient's grant and returns it in
the same response. The `apiEndpoint` carries a token; the server never stores
it, so do not log it, and ask again when it expires (asking again for the same
patient with the same permissions returns the same access while it is valid).
`attribution` is `'name-only'` when the patient's core predates the member
stamp: the access name still names the member. Against a group core without
member access the call throws `cmc-member-access-unsupported`; when the core
created the access but the answer arrived without its token (a proxy dropping
the field) it throws `cmc-member-access-token-missing`: ask again.

`requestMembership` checks before writing that every stream is a team stream
(`:_cmc:apps:<app>[:<path>]`, chats and collectors excluded), and throws
`cmc-membership-permissions-invalid` otherwise, as the server does.

A membership never has chat: `requestMembership` sends `features` as
`{ chat: false, systemMessaging: true }` by default, and the server treats
`chat` as false on a membership offer whatever is sent, so no chat channel is
created on either side. The group can still send system alerts to the member.

**Administrator side** (the group's personal token, or a delegate's)

```js
const admin = new pryv.Connection(groupAdminApiEndpoint);

const offer = await cmc.readOffer(pastedOrScannedUrl);
// offer.membership === true; offer.requester is the member;
// offer.requestedPermissions lists the teams asked for (show them as checkboxes).

const accepted = await cmc.acceptMembership(admin, pastedOrScannedUrl, {
  scopeStreamId: ':_cmc:apps:practice',            // group's stream where the accept lands
  grantedScopes: [':_cmc:apps:practice:team-a']    // optional: a subset of the requested teams
});
// accepted = { acceptEventId, membershipAccessId, member }
// An ordinary offer throws cmc-membership-offer-expected.

await cmc.declineMembership(admin, pastedOrScannedUrl, { scopeStreamId: ':_cmc:apps:practice' });

const members = await cmc.listMembers(admin);
// [{ membershipAccessId, member: { username, host }, appCode, scopeStreamId,
//    scopes, requestedScopes, approvedBy, acceptEventId, created, expires }]

await cmc.revokeMembership(admin, {
  membershipAccessId: members[0].membershipAccessId,
  scopeStreamId: members[0].scopeStreamId
});
// The group's core then sweeps the accesses it created for that member on
// patients' accounts, and records the sweep:
const { items } = await cmc.listSweeps(admin, { membershipAccessId: members[0].membershipAccessId });
const sweep = await cmc.getSweepStatus(admin, items[0].sweepEventId);
// sweep = { status, reason, outcome: [{ childAccessId, result: 'deleted' | 'absent' | 'residual' }],
//           residuals: [{ counterparty, childAccessId, expires, reason }], uncovered, ... }
// reason: 'revoke' | 'accesses.delete' | 'expired' | 'narrowed' | 'detach' |
//         'account-deleted' | 'vanished' (the membership access was found gone
//         by the server's periodic check while accesses minted for it remained)
// uncovered: on a 'narrowed' sweep caused by deleting a team stream, the
//         stream(s) deleted (the record is then on the deleted stream's parent);
//         [] otherwise
```

A membership approved with a delegate's token ends when that delegation is
detached, unless the owner keeps it. Member-to-group chat and alerts are not
supported (`cmc-member-channel-not-supported`).


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
