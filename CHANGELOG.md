# `pryv` changelog

<!-- Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) -->

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
