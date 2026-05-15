# `pryv` changelog

<!-- Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) -->

## [3.2.0-pre.1]

CMC (Cross-account Messaging & Consent) client-side helpers (open-pryv.io ≥ 2.0.0-pre.X).

### Added
- `pryv.cmc` namespace exposing the slug + stream-id helpers that mirror the server-side CMC plugin so apps can construct stream-ids deterministically:
  - **Namespace constants** — `NS` (`:_cmc:`), `NS_INBOX`, `NS_APPS`, `NS_INTERNAL`, `NS_INTERNAL_RETRIES`.
  - **Event-type constants** — `ET_REQUEST`, `ET_ACCEPT`, `ET_REFUSE`, `ET_REVOKE`, `ET_CHAT`, `ET_SYSTEM_ALERT`, `ET_SYSTEM_ACK`, `ET_SYSTEM_SCOPE_REQUEST`, `ET_SYSTEM_SCOPE_UPDATE`. Grouped collections `EVENT_TYPES_LIFECYCLE` / `EVENT_TYPES_CHAT` / `EVENT_TYPES_SYSTEM`.
  - **Slug helpers** — `slugifyHost(host)`, `counterpartySlug({ username, host })` → `<username>--<host-slug>`, `parseCounterpartySlug(slug)` → `{ username, hostSlug }`.
  - **Stream-id builders** — `appScope(appCode)`, `chatsParentUnder(scope)`, `chatStreamUnder(scope, slug)`, `collectorsParentUnder(scope)`, `collectorStreamUnder(scope, slug)`.
  - **Classification + parsing** — `isCmcStreamId(id)`, `isAppNestedPluginStream(id)`, `getAppCode(id)`, `parseChatStreamId(id)`, `parseCollectorStreamId(id)`.

### Notes
- Client + server use the same algorithms for slug + stream-id construction, so writes from this lib land on the same canonical paths the plugin auto-creates at acceptance.
- All helpers are pure functions; no network calls. Use `pryv.Connection` for the actual `events.create` / `accesses.create` calls.

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
