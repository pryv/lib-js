# `pryv` changelog

<!-- Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) -->

## [Unreleased]

### Added

- `pryv.SharedSecrets` — hand a secret to a third party by one-time key instead
  of putting it in a URL. `create(connection, {ttl, title, onConsumed, secret,
  signature?})` returns the key once; `retrieve(apiEndpoint, key, {passphrase |
  verifierSecret})` redeems it without any token, since the redeemer has no
  credentials yet; `status(connection, key)` inspects without consuming. For an
  `hmac-sha256` signature the key material is generated client-side so the proof
  can be bound before the secret exists — the verifier secret never leaves the
  caller. Crypto goes through the Web Crypto API, so the same code runs in Node
  and in the browser bundle. Needs open-pryv.io with the shared-secrets endpoints.

- `@pryv/cmc` **3.9.1** — `createInvite(conn, { …, accessType })` now accepts an
  optional `accessType: 'shared' | 'app'` (default `shared`), passed through to
  the offer's `request.accessType`. `'app'` requests a delegable data-grant so
  the approved requester can `accesses.create` scoped sub-accesses (needs
  open-pryv.io ≥ 2.0.0-rc.9).

## [3.8.1] - 2026-07-17

### Fixed

- `pryv.OAuth2Client.refresh()` is now production-safe against an always-rotating
  authorization server. Concurrent `refresh()` calls are serialized onto a single
  in-flight exchange, so a parallel caller is never rejected as token-reuse
  (`invalid_grant`). The rotated refresh token is now persisted BEFORE the
  `apiEndpoint` validation that can throw, so a validation failure (missing /
  momentarily `http:` endpoint) no longer strands the client on a dead token and
  permanently brick the session. Added a refresh-token persistence seam — a
  `refreshToken` constructor option, a `refreshToken` getter, and an
  `onTokenRotated` callback — so apps persist only the minimal secret across
  reloads instead of the whole `lastTokenResponse` blob.

## [3.8.0]

### Added

- `pryv.OAuth2Client` — browser-side consumer of the OAuth2 authorization-code
  flow with PKCE. `redirectToAuthorize()` → (browser bounces through
  `/oauth2/authorize` and back to the redirect URI) → `handleCallback()`, which
  returns a ready `pryv.Connection`; `refresh()` swaps the refresh token for a
  fresh connection. The authorization-server endpoints are discovered via
  RFC 8414 (`<issuer>/.well-known/oauth-authorization-server`). The `scope`
  option carries a consent-offer reference (`cmc:<offer-name>`) registered on
  the OAuth client; the granted permission set is granular and the user may
  untick individual permissions on the consent screen.

### Changed

- **Node floor raised to `>= 20.19` (or `>= 22.12`).** `pryv` now depends on the
  ESM-only `oauth4webapi` package and loads it via `require(esm)`, which is
  unflagged only on those Node releases.

### Notes

- Bundlers: `oauth4webapi` is ESM and ships an `exports` field. Consumers who
  bundle `pryv` themselves need an `exports`-field-aware bundler
  (webpack 5 / vite / rollup / esbuild — all fine). webpack-4 / browserify users
  should consume the prebuilt `dist/` bundle instead.

## [3.8.0]

`pryv` + `@pryv/socket.io` + `@pryv/monitor` 3.8.0; ships alongside
`@pryv/cmc` 3.8.0/3.9.0 (versioned separately).

### Added

- Auth-completion URL params accept the modern lowercase form (`pryvKey` /
  `pryvPoll`) in addition to the legacy capital-Y form (`prYvkey` /
  `prYvpoll`, now documented as deprecated).
  `utils.cleanURLFromPrYvParams` strips both forms while preserving
  long-lived `pryv*` params (`pryvServiceInfoUrl`, `pryvApiEndpoint`).
- `@pryv/cmc` 3.8.0/3.9.0: `requestAccept` / `requestAcceptUrl` and
  `proposeScopeUpdate` → `requestScopeUpdate` / `requestScopeUpdateUrl`
  hand-offs for apps without a personal token (the server now gates
  `consent/accept-cmc` and `consent/scope-update-cmc` to personal tokens).

### Fixed

- Type declarations: the default export's `utils` type had drifted from the
  named `utils` export (the deprecated `extractTokenAndApiEndpoint` /
  `buildPryvApiEndpoint` aliases were missing), which made TypeScript reject
  `pryv` as an argument to add-on initializers such as
  `@pryv/socket.io`'s `extendPryvSocketIO(pryv)`. The default export now
  references the named export's type directly.
- `@pryv/socket.io` type declarations: added the missing `accessUpdated` and
  `notificationsChanged` event names and the `subscribe()` / `unsubscribe()` /
  `getSubscriptions()` method declarations (all present at runtime since
  3.7.0).
- `@pryv/socket.io` README: the accesses notification event is
  `accessesChanged` (the documented `accessChanged` never fired); documented
  the full event list.

## [3.7.1]

Patch release — email→username recovery on multi-node platforms.

### Fixed

- `Service.userIdForEmail`: follow the home-node redirect when the queried
  node does not host the account. On platforms that store identifiers
  pseudonymised, that node answers `307` with the home-node URL in a
  `{ server }` body; `userIdForEmail` now follows it so the cleartext username
  is returned transparently. `fetch` already follows redirects automatically;
  this also handles HTTP clients that do not.

## [3.7.0]

Scoped real-time notifications.

### Added

- `@pryv/socket.io`: `notificationsChanged` event + `subscribe()` /
  `unsubscribe()` / `getSubscriptions()` methods to register scoped
  notification subscriptions on a connection (each an `events.get`-shaped query
  of one resource kind: `events` / `streams` / `accesses`). Matched changes are
  delivered as a single `notificationsChanged({ keys })`.
- `@pryv/monitor`: the Socket update method now registers the monitor's scope
  with the server and refetches only on a matching notification. Falls back to
  the coarse `eventsChanged` / `streamsChanged` signals on servers without
  scoped-notification support, so existing behaviour is unchanged against older
  platforms.

Requires an open-pryv.io platform with scoped-notification support; against
older platforms the monitor transparently uses the coarse signals.

## [3.6.1]

Patch release — browser auth-flow cleanup and dependency hygiene. No API
changes.

### Fixed
- Browser: the `#?prYv…` redirect parameters (`prYvkey`, `prYvstatus`,
  `prYvpoll`, …) are now removed from the visible page URL once consumed
  after the auth redirect (`history.replaceState`, guarded for
  non-browser environments and a missing History API). They previously
  stayed in the address bar, leaked into bookmarks and copied links, and
  made downstream URL-handling bugs harder to diagnose.

### Maintenance
- Dev-dependency audit brought to zero vulnerabilities (overrides for
  transitive `diff` / `serialize-javascript`); type-check fixes.
- Removed the dead, non-exported `AuditLog` TypeScript type from
  `index.d.ts`. It described the response shape of the long-deprecated
  `GET /audit/logs` route (removed server-side); audit logs are read as
  regular events through `connection.get('events', …)` over `:_audit:`
  streams. No public API surface changes (the type was never exported).
- AGENTS.md added; publishing doc corrected (`just version` does not
  commit or tag).

## [3.6.0]

Adds support for the platform's content queries: `events.get` can now
filter on the JSON content of events. Purely additive — no breaking
changes. Platform support is required for the new query parameters
(advertised by `features.contentQueries` in service info); against
older platforms the parameters are rejected with a `400` and
`Service#supportsContentQueries()` returns `false`.

### Added
- `events.get` accepts `content` and `clientData` parameters — arrays
  of conditions (`{ path, eq|neq|in|exists|gt|gte|lt|lte|prefix }`) on
  dot-paths into the corresponding event field (or `$` for the root
  value of scalar content). Works in batch calls and
  `Connection#getEventsStreamed()`.
- `Connection#getLatestByContent(path, values, baseQuery?)` — returns a
  `Map` of value → latest matching event (one entry per value found).
  Typical form-prefill lookup ("latest assertion per code"); pages
  through results internally so it is correct regardless of the
  server's default page size. `baseQuery` (e.g. `streams`, `types`)
  passes through.
- `Service#supportsContentQueries()` — reads `features.contentQueries`
  from service info, so apps can pick a fallback path on platforms
  without content queries.
- TypeScript: `ContentQueryCondition` type; `content` / `clientData` on
  `EventQueryParams`; declarations for both new methods.

### Fixed
- URL encoding of structured query parameters in GET requests
  (`Connection#getEventsStreamed()`): object values and arrays
  containing objects (e.g. rich `streams` queries) are now sent as one
  JSON-encoded parameter instead of `[object Object]`.

## [3.5.0]

Narrows the auth-flow result surface and introduces a new
`pryv.connectFromKey(key, serviceInfoUrl)` helper. Calling apps that
read `state.apiEndpoint` from the `onStateChange` callback on a fresh
auth-flow result must migrate to the new helper; cookie-autologin
keeps working as before.

### Changed
- `onStateChange(state)` on `state.status === AUTHORIZED` reached
  through a **fresh** auth-flow poll (poll → ACCEPTED) now receives
  only `{ status, id, key, serviceInfo? }`. Credentials (`username`,
  `token`, `apiEndpoint`) stay inside the lib.
- Cookie-autologin AUTHORIZED states (page reload after a prior sign-in)
  still carry `apiEndpoint`/`username` so existing pages that build a
  Connection on autologin keep working — autologin happens before any
  fresh `key` exists.

### Added
- `pryv.connectFromKey(key, serviceInfoUrl, serviceCustomizations?)` —
  module-level helper that builds a `Service`, fetches its info, and
  resolves a completed-auth `key` into a `Connection`.
- `Service#connectFromKey(key)` — instance variant for callers that
  already hold a `Service`.
- `examples/cli-login.js` — headless polling pattern reference (Node).
  Pairs with the auth UI's new `?cli=1` query flag, which renders a
  terminal "you can close this window" screen instead of trying to
  close a popup or redirect.

### Migration

For consumers that today do `new pryv.Connection(state.apiEndpoint)` on
the fresh auth-flow path:

Before:
```js
onStateChange: (state) => {
  if (state.id === pryv.Auth.AuthStates.AUTHORIZED) {
    const connection = new pryv.Connection(state.apiEndpoint);
  }
}
```

After:
```js
onStateChange: async (state) => {
  if (state.id === pryv.Auth.AuthStates.AUTHORIZED) {
    const connection = state.key
      ? await pryv.connectFromKey(state.key, serviceInfoUrl)
      : new pryv.Connection(state.apiEndpoint); // cookie-autologin path
  }
}
```

### Added
- `pryv.connectFromKey(key, serviceInfoUrl, serviceCustomizations?)` —
  module-level convenience that builds a `Service`, fetches its info,
  and resolves a completed-auth `key` into a `Connection`.
- `Service#connectFromKey(key)` — instance variant for callers that
  already hold a `Service`.
- `examples/cli-login.js` — headless polling pattern reference (Node).
  Pairs with the auth UI's new `?cli=1` query flag, which renders a
  terminal "you can close this window" screen instead of trying to
  close a popup or redirect.

### Migration
Before (`3.x`):
```js
const authSettings = {
  onStateChange: (state) => {
    if (state.id === pryv.Auth.AuthStates.AUTHORIZED) {
      const connection = new pryv.Connection(state.apiEndpoint);
    }
  },
  ...
};
```

After (`4.0`):
```js
const authSettings = {
  onStateChange: async (state) => {
    if (state.id === pryv.Auth.AuthStates.AUTHORIZED) {
      const connection = await pryv.connectFromKey(state.key, serviceInfoUrl);
    }
  },
  ...
};
```

## [3.4.1]

Lockstep patch of `pryv@3.4.1` + `@pryv/monitor@3.4.1` +
`@pryv/socket.io@3.4.1` + `@pryv/cmc@1.1.1`. Bugfix release; carries
the SDK side of a coordinated fix with the server-side `cmc` plugin
on `open-pryv.io` master.

### `@pryv/cmc@1.1.1`

#### Fixed
- **Features-negotiation contract drift on `acceptInvite` /
  `listAcceptedRelationships`.** Reported by a deploy-side implementer
  against `@pryv/cmc@1.1.0` + `open-pryv.io@04bb2c1`.
  - `acceptInvite` now persists the resolved offer features into
    `content.features` of the `consent/accept-cmc` trigger (both keys
    default to `true` when omitted by the offer, per the README contract;
    explicit `false` is binding both ways). The server-side plugin
    forwards them onto the data-grant access's `clientData.cmc.features`.
    Previously the SDK computed `offerFeatures` but never persisted it,
    so the data-grant access ended up with `clientData.cmc.features:
    null` on the accepter side even when the offer specified default-true.
  - `listAcceptedRelationships` mapper now defaults absent
    `content.features` to `{ chat: true, systemMessaging: true }` (was
    `{ chat: false, system: false }` — both wrong-default AND wrong-key
    name; `systemMessaging` is the documented contract everywhere else).
    The legacy `content.extra` fallback was removed (it was a
    workaround for the SDK-side write bug and is unreachable for
    events produced by `@pryv/cmc >= 1.1.1`).
  - **4 new contract tests** under `[CMCL1OF] J6 features-negotiation`
    pin each fix at unit-test time so a regression surfaces without
    needing a real backend round-trip.

#### Migration
- **No SDK API changes.** Callers of `acceptInvite(conn, capabilityUrl,
  opts)` and `listAcceptedRelationships(conn)` see the same return
  shapes; the fix is in what gets persisted server-side + what the
  mapper exposes when `content.features` is absent.
- **Server compatibility:** the fix is coordinated with the server-side
  `cmc` plugin shipped in `open-pryv.io` master (Plan 68 4th reopen,
  2026-05-21). Older `@pryv/cmc` clients writing to a fixed server will
  still produce `clientData.cmc.features: null` because the SDK isn't
  writing `content.features` — bump to `@pryv/cmc@1.1.1` to get the
  full negotiation persisted.

## [3.4.0]

Lockstep release of `pryv@3.4.0` + `@pryv/monitor@3.4.0` +
`@pryv/socket.io@3.4.0`, plus `@pryv/cmc@1.1.0` (additive — new error
ids on the catalogue + new wire-shape contract tests).

### `@pryv/cmc@1.1.0`

#### Added
- **7 new error ids** on `cmc.errorIds`, mirroring the server-side
  `CmcErrorIds` additions shipped in `open-pryv.io` 2.0.0-pre.4 (cmc
  plugin commit `0306c7e`):
  - `CAPABILITY_TTL_OUT_OF_RANGE` (`cmc-capability-ttl-out-of-range`)
    — server now bounds `content.expiresAt` to `[60s, 30d]` at mint.
    Omit `expiresAt` to use the 7-day default; pick a value in range
    to override.
  - `HANDLER_MISSING_CAPABILITY_ID` (`cmc-handler-missing-capability-id`)
    — was on the server catalog but missing from the SDK mirror.
  - `CHAT_DISABLED` (`cmc-chat-disabled`) — feature-gating: writes
    rejected when the relationship's `clientData.cmc.features.chat ===
    false`. Default-permit on omission.
  - `SYSTEM_MESSAGING_DISABLED` (`cmc-system-messaging-disabled`) —
    same for `features.systemMessaging`. Scope-request /
    scope-update remain protocol-level and permitted regardless.
  - `CLIENTDATA_CMC_FORBIDDEN` (`cmc-clientdata-cmc-forbidden`) —
    `accesses.create` / `accesses.update` reject any user-supplied
    `clientData.cmc.*`. Use this to catch hand-crafted forge attempts
    surfacing as 400-not-200 from the api-server.
  - `RESERVED_STREAM_UNDELETABLE` (`cmc-reserved-stream-undeletable`)
    — `streams.delete` rejects the five reserved CMC parents +
    `:_cmc:_internal:*` + plugin-managed `chats`/`collectors` segments
    even from personal tokens. App code should not target these.
  - `COUNTERPARTY_IDENTITY_MISSING` (`cmc-counterparty-identity-missing`)
    — peer-side `content.from` stamping hook rejects a write when the
    counterparty access has no stored `{username,host}` identity.
    Surfaced for ops; app developers shouldn't see it under normal
    flow.

#### Tests
- New `[CMCXEC]` J9 catalogue-match test pinning all 7 ids against
  the server-side strings. Future drift between SDK + server will
  fail at unit-test time.
- New `[CMCL1OB]`–`[CMCL1OH]` wire-shape contract tests (J3, J4, J5,
  J7, J8) covering `listInvites` (uses `streams` not `streamIds`),
  `listAcceptedRelationships` counterparty-mapping precedence
  (content.from > content.acceptedBy > null fallback), `waitForAccept`
  `sinceTime` filter (defensive passthrough when `ev.time` missing),
  `acceptInvite` `scopeStreamId` requirement, `acceptInvite`
  `dataGrantAccessId` resolution post-completion.

#### Compatibility
- **No source-level breaking changes.** Existing apps using
  `pryv@3.3.x` + `@pryv/cmc@1.0.x` continue to work; the new error ids
  are additive. The `^3.3.0` peer-dep selector on `@pryv/cmc` resolves
  cleanly against `pryv@3.4.0` so apps that pin only `@pryv/cmc` get
  the new `pryv` transitively without action.

### `pryv@3.4.0`, `@pryv/monitor@3.4.0`, `@pryv/socket.io@3.4.0`

- No code changes. Versions bumped in lockstep with `@pryv/cmc@1.1.0`
  so operators upgrade with `npm install pryv@3.4.0 @pryv/cmc@1.1.0`
  and pick up the new ids + the monitor / socket.io packages follow
  via transitive resolution.

### Server-side coverage

This SDK release pairs with `open-pryv.io` 2.0.0-pre.4 (cmc plugin
commit `0306c7e`+) which ships:
- Plugin field-stamping completion (`inviteEventId` on inbox mirrors,
  `requestEventId` on capability accesses via post-create hook).
- Capability TTL configurable per-invite, bounded `[60s, 30d]`.
- Feature-gating enforced at send time on `handleChat` / `handleSystem`.
- Forge-prevention on `accesses.create` / `accesses.update` /
  `streams.delete` (new route-level hooks).
- `content.from` stamping extended from `:_cmc:inbox` to per-app
  chats/collectors writes by counterparty-marked accesses.
- `:_cmc:_internal:*` defense-in-depth filter on `events.get` /
  `events.getOne` / `streams.get`.

See `open-pryv.io/components/cmc/CHANGELOG-v2.md` for the server-side
detail.

## [3.3.2]

Lockstep patch release of `pryv@3.3.2` + `@pryv/monitor@3.3.2` +
`@pryv/socket.io@3.3.2` + `@pryv/cmc@1.0.2`.

### `@pryv/cmc@1.0.2`

#### Fixed
- `readOffer(capabilityUrl)` no longer passes a `streams` filter to
  `events.get`. Follow-up to 1.0.1: the previous fix changed
  `streamIds` to `streams` (correct field name) but the value
  `[':_cmc:_internal:offer']` referenced a stream that doesn't
  exist on the user's account. Only the per-capability children
  `:_cmc:_internal:offer:<capId>` are auto-provisioned, and the
  accepter doesn't know `<capId>` from the `capabilityUrl` alone. The
  api-server rejected the call with `unknown-referenced-resource`.
  The fix mirrors the plugin's own `readOfferViaCapability`
  (`open-pryv.io/components/cmc/src/acceptOrchestration.ts`):
  omit the `streams` filter entirely and rely on the capability
  access's permissions to narrow the response to the single offer
  event the token can read. The `types: ['consent/request-cmc']`
  filter is kept as defense in case the offer stream ever holds more
  than one event in future revisions.

#### Test
- `[CMCL1OA]` updated to assert `events.get` is called WITHOUT a
  `streams` field AND with a `types: ['consent/request-cmc']` filter.

### `pryv@3.3.2`, `@pryv/monitor@3.3.2`, `@pryv/socket.io@3.3.2`

- No code changes. Versions bumped in lockstep with `@pryv/cmc@1.0.2`.

## [3.3.1]

Lockstep patch release of `pryv@3.3.1` + `@pryv/monitor@3.3.1` +
`@pryv/socket.io@3.3.1` + `@pryv/cmc@1.0.1`.

### `@pryv/cmc@1.0.1`

#### Fixed
- `readOffer(capabilityUrl)` now passes `streams` (the recursive read
  filter) to `events.get` instead of `streamIds` (which is the
  `events.create` write target). The api-server schema rejects
  `streamIds` on `events.get` with `OBJECT_ADDITIONAL_PROPERTIES`, so
  the previous code threw on every call. Affects any patient/doctor app
  using `cmc.readOffer(url)` to preview an offer before
  `acceptInvite` — typically apps rendering an offer-preview screen
  with title / description / requested permissions.
- Internal use by `cmc.acceptInvite` was unaffected (its `readOffer`
  call is wrapped in `try/catch` that silently falls back to null
  counterparty fields).

#### Added
- Contract test for `readOffer`'s wire-shape: stubs `pryv.Connection`
  and asserts the inner `apiOne('events.get', …)` call uses `streams`
  (not `streamIds`). This class of typo will now fail at unit-test
  time instead of only against a real api-server.

### `pryv@3.3.1`, `@pryv/monitor@3.3.1`, `@pryv/socket.io@3.3.1`

- No code changes. Versions bumped in lockstep with `@pryv/cmc@1.0.1`
  so the four packages stay aligned (operators upgrade by `npm install
  pryv@3.3.1 @pryv/cmc@1.0.1`; the monitor / socket.io packages follow
  via transitive resolution).

## [3.3.0]

Lockstep release of `pryv@3.3.0` + `@pryv/monitor@3.3.0` +
`@pryv/socket.io@3.3.0`, plus the new sibling package
`@pryv/cmc@1.0.0`.

### `pryv@3.3.0`

#### Removed
- `pryv.cmc.*` namespace (slug helpers, stream-id builders, event-type
  constants, classifiers, `extractActor`). Moved to the new sibling
  package `@pryv/cmc@1.0.0`. The single consumer of `pryv.cmc.*`
  (hds-macro) was still on `pryv@3.0.4` at the time of this release;
  no migration shim was added. Apps using `pryv.cmc.*` from a
  hypothetical `npm install pryv@3.2.0` should `npm install @pryv/cmc`
  and replace `pryv.cmc.X` with `cmc.X` via
  `const cmc = require('@pryv/cmc')`.

#### Added
- `pryv.utils.decomposeAPIEndpoint(apiEndpoint, serviceInfoApi)` —
  decomposes a Pryv apiEndpoint into `{ token, username, host }` by
  inverting the platform's `service.info.api` URL template (subdomain
  vs path-style). Returns the **canonical platform host** (no
  `<username>.` subdomain prefix) — the identity cross-account
  features (e.g. CMC counterparty slugs) key on, regardless of which
  user the endpoint belongs to. Previously available as
  `pryv.cmc.extractActor` (now in `@pryv/cmc`); promoted to `utils`
  since it's generally useful for any caller mixing subdomain and
  path-style topologies. Return shape typed as
  `pryv.DecomposedAPIEndpoint`.

### `@pryv/cmc@1.0.0` (NEW)

New sibling package — see `components/pryv-cmc/README.md` (and the
inline JSDoc) for the full Level-0 + Level-1 surface.

- **Level-0** — moved verbatim from `pryv.cmc.*`: namespace + event-type
  constants, slug helpers (`slugifyHost` / `counterpartySlug` /
  `parseCounterpartySlug`), stream-id builders, classifiers, parsers,
  and the typed `errorIds` catalogue + new `CmcError` class.
- **Level-1** — protocol functions on top of `pryv.Connection`:
  `createInvite`, `listInvites`, `getInviteStatus`, `revokeRelationship`,
  `invalidateCapability`, `requestScopeUpdate`, `readOffer`,
  `acceptInvite` (default-waits for trigger `status: 'completed'`, opt
  out with `waitForCompletion: false`), `refuseInvite`,
  `revokeAcceptance`, `listAcceptedRelationships`, `sendChat`,
  `sendSystemAlert`, `sendSystemAck`, `acceptScopeUpdate`,
  `refuseScopeUpdate`.
- **Observation scopes** — `scopes.inbox()`, `scopes.chats(...)`,
  `scopes.collectors(...)` return `{ streams: [...] }` objects ready to
  hand to `new pryv.Monitor(conn, scope)`.
- Peer-depends on `pryv@^3.3.0`. Targets Node ≥ 20.

### `@pryv/monitor@3.3.0`, `@pryv/socket.io@3.3.0`

- No code changes. Versions bumped in lockstep with `pryv@3.3.0` so the
  three companion packages stay aligned on a single release line.

## [3.1.0]

Plan 66 (open-pryv.io ≥ 2.0.0-pre.X): access versioning.

### Added
- `pryv.utils.parseAccessRef(ref) → { base, serial | null }` — parses the wire-format access reference. Bare cuid → `{ base, serial: null }`, composite `<base>:<serial>` → `{ base, serial: <int> }`. Throws on malformed input.
- `pryv.utils.serializeAccessRef({ base, serial }) → string` — inverse helper.
- `pryv.StaleAccessIdError` — typed error (extends `PryvError`) surfaced when the server responds with `409 stale-resource` on `accesses.update` / `accesses.delete`. Carries `{ provided, currentSerial }` in `.data` so callers can refetch + retry.
- `connection.updateAccess(id, changes)` — convenience wrapper around `accesses.update`. Automatically translates the server's 409 response into `StaleAccessIdError`.
- `connection.getAccessWithHistory(id)` — convenience wrapper around `accesses.getOne?includeHistory=true`. Returns `{ access, current?, history?: [...] }`.
- `connection.accessInfo(forceRefresh)` — now memoized. First call fetches from the server and caches; subsequent calls return the cached copy in O(1). Pass `forceRefresh: true` to bypass the cache and re-fetch. Cached object reference is stable across calls (safe to compare).
- `connection.socket.open()` — when the server emits `accessUpdated` (Plan 66 fine-grained event), the SocketIO layer automatically invokes `connection.accessInfo(true)` so the cache reflects the new permissions / serial on the next read. Best-effort: a failed refresh leaves any prior cached value intact.
- `@pryv/socket.io`: `'accessUpdated'` is now an allowed event for `socket.on(...)`. Payload: `{ type: 'access-updated', accessId: '<base>:<serial>', serial }`.
- `@pryv/monitor`: `monitor.onAccessUpdated(handler)` — register a callback for the server-pushed `accessUpdated` event. Requires `Monitor.UpdateMethod.Socket` (the event is server-pushed via socket.io; polling-based update methods won't fire it). The handler receives the structured payload above.

### Notes
- Wire-format compatibility: every `access.id` / `access.createdBy` / `access.modifiedBy` returned by a Plan-66-capable server is parseable with `parseAccessRef`. Older servers still return bare cuids — `parseAccessRef` returns `{ base, serial: null }` for those, so callers can use the helper unconditionally.

## [3.0.4](https://github.com/pryv/lib-js/compare/3.0.3...3.0.4)

### Added
- `Service.userExists(userId)` — `true`/`false` lookup, no throw on 404.
- `Service.userIdForEmail(email)` — returns username or `null`.
- `Service.availableHostings()` — raw `<register>/hostings` tree.
- `Service.flatHostings()` — list of `{ key, name, description, region, zone, availableCore, available }` items.
- `Service.createUser(opts)` — register a new user; hides v1/v2 endpoint shape difference. Pass `hosting: 'auto'` to pick the first available hosting.
- `Service.requestPasswordReset(userId, appId)` — pre-auth reset trigger.
- `Service.resetPassword(userId, newPassword, resetToken, appId)` — pre-auth password set with token.
- `Service.mfaChallenge(userId, mfaToken)` — re-trigger an MFA SMS challenge during a pending login.
- `Service.mfaVerify(userId, mfaToken, code)` — finish an MFA-protected login; returns a `Connection`.
- `Service.startAccessRequest(authRequest)` — POST the platform auth endpoint, returns `{ key, authUrl, poll, pollRateMs }`. Use for non-browser auth flows; `Browser.setupAuth` already wraps this for the browser case.
- `Service.pollAccessRequest(keyOrPollUrl)` — one-shot poll; accepts the canonical poll URL or a bare key.
- `pryv.MfaRequiredError` — thrown by `Service.login` when the platform returns `{ mfaToken }` instead of `{ token }`. Extends `PryvError`, carries `.mfaToken`. Replaces the previous `Error('Invalid login response: …')` substring-matching path with a typed branch.
- `PryvError.fromApiResponse(response, body)` static factory; `PryvError` instances now carry `id`, `status`, `response` fields when built via the factory (additive — legacy 2-arg `new PryvError(message, innerObject)` constructor unchanged).
- `pryv.ERRORS` — frozen catalogue of API error ids (mirrors `open-pryv.io/components/errors/src/ErrorIds.js`). Use these constants instead of hardcoding magic strings.

### Changed
- `Service.login` now throws `PryvError` (with structured `id`/`status`/`response`) on non-2xx responses instead of plain `Error`. The `error.message` still matches the API's `body.error.message` so existing substring-matching consumer code keeps working — but consumers can now branch on `err.id` / `err.status` instead.

## [3.0.3](https://github.com/pryv/lib-js/compare/3.0.2...3.0.3)
- `@pryv/socket.io`: cap reconnection (`reconnectionAttempts: 10`, `reconnectionDelayMax: 60000`, `randomizationFactor: 0.5`) so a server-side outage no longer drives an unbounded reconnect loop. Listens for `reconnect_failed` and surfaces a terminal `error` event so consumers can clean up instead of leaving a zombie socket reference.
- `@pryv/monitor`: when the underlying socket.io transport dies (terminal `reconnect_failed`), drop the cached socket reference so a future `Changes.READY` cycle rebuilds from scratch instead of short-circuiting on the dead handle.

## [3.0.2](https://github.com/pryv/lib-js/compare/3.0.0...3.0.2)
- Socket.IO: use WebSocket transport directly instead of polling-first. Fixes connection failures against service-core v2 cluster mode (which disables HTTP long-polling).

## [3.0.0](https://github.com/pryv/lib-js/compare/2.4.5...3.0.0)
- Removing superagent dependency (breaking change)
- Enhancing test suite
- Changing linter & typescript coverage

## [2.4.5](https://github.com/pryv/lib-js/compare/2.3.1...2.4.5)
- Enhanced typescripts definition
- Adding `Connextion.apiOne()` and `Connextion.apiOne()`
- Some untracked changes

## [2.3.1](https://github.com/pryv/lib-js/compare/2.2.0...2.3.1)

### Deprecated
- `global.Pryv`, renamed to `global.pryv` (when loaded with `<script>`)
- `utils.extractTokenAndApiEndpoint()`, renamed to `utils.extractTokenAndAPIEndpoint()`
- `utils.buildPryvApiEndpoint()`, renamed to `utils.buildAPIEndpoint()`

### Changed
- _Dev: Grouped library and add-ons (Socket.IO & Monitor) in monorepo_
- _Dev: run tasks with `just`, lint with `semistandard`, license with `source-licenser`_

### Removed
- JSDoc generated docs (to avoid confusion with docs in READMEs)


## [2.2.0](https://github.com/pryv/lib-js/compare/2.1.7...2.2.0) – 2022-01-10

### Added
- TypeScript typings from [@ovesco](https://github.com/ovesco)


## [2.1.7](https://github.com/pryv/lib-js/compare/2.1.0...2.1.7) – 2021-05-10

### Removed
- _Dev: Removed `jsdoc` dependency for security reason_


## [2.1.0](https://github.com/pryv/lib-js/compare/2.0.3...2.1.0) – 2020-10-22

### Added
- Extendable UI feature

### Changed
- UI separated from the Authentication logic


## [2.0.3](https://github.com/pryv/lib-js/compare/2.0.1...2.0.3) – 2020-06-22

### Added
- `Connection.username()`

### Fixed
- `Origin` header in browser distribution

### Security
- Various dependencies upgrades


## 2.0.1 Initial release – 2020-04-06
