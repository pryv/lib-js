# `pryv` changelog

<!-- Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) -->

## [3.0.0](https://github.com/pryv/lib-js/compare/2.4.5...3.0.0)
- Removing superagent dependency (breaking change)
- Enhancing test suite

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
