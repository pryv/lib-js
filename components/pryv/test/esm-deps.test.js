/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

// `pryv` consumes the ESM-only `oauth4webapi` package via Node's require(esm)
// (unflagged on Node >= 20.19 / >= 22.12 — hence the engines floor). That only
// works while nothing in the package's import graph uses top-level await; a
// future dependency upgrade that introduced TLA would throw
// ERR_REQUIRE_ASYNC_MODULE at require time. This guard makes such an upgrade
// fail here in CI instead of at consumer runtime.
describe('[ESMD] ESM-only deps load via require(esm)', function () {
  it('[ESMD1] oauth4webapi requires synchronously (no top-level await in its graph)', function () {
    const oauth = require('oauth4webapi');
    expect(typeof oauth.generateRandomCodeVerifier).to.equal('function');
    expect(typeof oauth.calculatePKCECodeChallenge).to.equal('function');
  });
});
