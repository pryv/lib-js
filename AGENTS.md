# AGENTS.md

Welcome, agent. Fast orientation for this repo so you don't rediscover it the hard way. Complements `README.md` (the full usage documentation) — read this first for shape, the README for depth.

## What this repo is

`lib-js` is the source of the **`pryv` npm package** — the JavaScript client library for applications talking to a Pryv.io platform, in Node.js (≥ 20) and in browsers. If you are building *against* Pryv.io, this library is the recommended path; if you are working *on* the server, that's [`pryv/open-pryv.io`](https://github.com/pryv/open-pryv.io) (which has its own AGENTS.md).

Agent-facing API documentation: <https://pryv.github.io/llms-full.txt> (dense single-page reference). Human docs: <https://pryv.github.io/>.

It is an **npm-workspaces monorepo** publishing four packages:

| Package | Folder | Purpose |
|---|---|---|
| `pryv` | `components/pryv/` | Core library: `Connection`, `Service`, `Auth`/`Browser` flows, utils |
| `@pryv/socket.io` | `components/pryv-socket.io/` | Socket.IO transport add-on (live change notifications) |
| `@pryv/monitor` | `components/pryv-monitor/` | Polling-based account-change monitor add-on |
| `@pryv/cmc` | `components/pryv-cmc/` | Cross-account messaging & consent helpers (versioned independently) |

Browser bundles built from the same source are published to the `gh-pages` branch and served at `https://api.pryv.com/lib-js/pryv.js` (ES5), `pryv-es6.js`, plus add-on and combined bundles.

## Quick repo map

```
components/pryv/src/
  index.js            Entry point — exports Service, Connection, Auth, Browser, utils, errors
  index.d.ts          TypeScript declarations (keep in sync with code changes)
  Connection.js       Per-account API access: api()/get()/post(), batching, attachments, HF helpers
  Service.js          Platform level: service info, login, auth-request start/poll, hostings
  utils.js            apiEndpoint parsing/building, environment detection, fetch helpers
  Auth/               Browser auth flow state machine (setupAuth, AuthController, AuthStates)
  Browser/            LoginButton, CookieUtils
  lib/                Errors (PryvError, MfaRequiredError, StaleAccessIdError), streamed JSON
                      event getter, query-param builders, error-id catalogue
components/*/test/    Per-component Mocha/Chai tests
examples/             Browser HTML + Node examples (kept runnable — they double as docs)
dist/                 Built browser bundles — a separate checkout of the gh-pages branch
webpack.config.js     Browser bundle build
justfile              All dev commands (run `just` to list)
```

## Commands

```bash
just install              # npm install (workspaces)
just build                # webpack → dist/ (browser bundles)
just test all             # all components' tests (or: just test pryv)
just test-browser         # browser tests against built dist/
just lint / just lint-fix # ESLint (neostandard, semicolons required)
just typecheck            # checks index.d.ts declarations
```

Tests can target a specific platform via `TEST_PRYVLIB_SERVICEINFO_URL` (defaults to the Pryv Lab platform).

## Releasing — version, tag, publish (all three, always)

```bash
just version 3.7.0        # bumps every package.json (root + workspaces) — does NOT commit or tag
git commit -am "3.7.0" && git tag 3.7.0   # commit + tag are MANUAL — this step is the one history forgot
just publish-npm          # publishes all workspace packages to npm
just build && just publish-browser   # pushes built bundles to gh-pages (CDN)
git push && git push --tags          # DON'T FORGET — tags must reach GitHub
```

Conventions:

- **Tags are bare versions** (`3.6.0`, no `v` prefix), matching `tag-version-prefix: ""` in the root `package.json`. `just version` deliberately runs `npm version --no-git-tag-version`, so tagging is your job.
- **npm, `package.json`, and git tags must agree.** Agents and integrators cross-check the three; a published npm version without a matching pushed tag reads as a discrepancy. If you find them out of sync, fix the tags.
- New API surface ⇒ update `CHANGELOG.md`, `index.d.ts`, and the README usage section in the same change.

## Pitfalls

- **Dual environment.** Everything in `components/pryv/src` must work in Node *and* browsers; environment forks go through `utils.isBrowser()`. Don't import Node built-ins at module top level outside guarded paths.
- **ES5 bundle is a target.** `dist/pryv.js` is transpiled for older browsers; avoid syntax/idioms that break the webpack+babel pipeline without checking `just build`.
- **Auth-flow state shape (since 3.5.0).** On a fresh auth flow, the `AUTHORIZED` state delivers `{status, id, key, serviceInfo?}` — credentials are obtained via `pryv.connectFromKey(state.key, serviceInfoUrl)`, not read off the state. Cookie-autologin still carries `apiEndpoint`/`username` for backward compatibility. Don't "simplify" this back.
- **Composite access ids.** After `accesses.update`, ids take the `{base}:{serial}` form; `Connection#updateAccess()` throws `StaleAccessIdError` on 409 — preserve that behavior.
- **`dist/` is a branch checkout**, not build output to commit on `master`. Never `git add dist/` from the master tree; use `just publish-browser`.

## Where to file issues / PRs

- Bugs + feature requests: [`pryv/open-pryv.io` GitHub Issues](https://github.com/pryv/open-pryv.io/issues) — single tracker for the Pryv developer experience (server, this library, docs); maintainers route internally. PRs here against `master`.

## When in doubt

- `components/pryv/src/index.js` exports everything — start there.
- The `examples/` folder shows intended usage patterns; keep them working.
- API behavior questions: <https://pryv.github.io/reference/> is canonical.
