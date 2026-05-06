/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

describe('[PWRX] Service.requestPasswordReset', function () {
  let service;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    service = new pryv.Service(testData.serviceInfoUrl);
  });

  it('[PWRA] rejects when required args are missing', async function () {
    let caught;
    try {
      await service.requestPasswordReset(testData.username);
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(pryv.PryvError);
  });

  it('[PWRB] either resolves or throws PryvError (server may require trusted appId)', async function () {
    this.timeout(15000);
    // Pryv platforms typically restrict password-reset to a trusted-appId
    // allowlist (pryv.me does). On a permissive deployment this resolves;
    // on a stricter one we expect a structured PryvError, not a raw throw.
    let caught;
    try {
      await service.requestPasswordReset(testData.username, 'jslib-test');
    } catch (e) {
      caught = e;
    }
    if (caught) {
      expect(caught).to.be.instanceOf(pryv.PryvError);
      expect(caught.status).to.be.gte(400);
    }
  });
  // Note: a "user does not exist" path can't be exercised against pryv.me
  // because per-user DNS doesn't resolve for unregistered usernames — fetch
  // throws TypeError before any HTTP exchange. That's an environmental
  // limit, not a code path; the bogus-reset-token test below covers the
  // server-side error-mapping equivalent.
});

describe('[PWSX] Service.resetPassword', function () {
  let service;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    service = new pryv.Service(testData.serviceInfoUrl);
  });

  it('[PWSA] rejects when required args are missing', async function () {
    let caught;
    try {
      await service.resetPassword(testData.username, 'newpw', '', 'jslib-test');
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(pryv.PryvError);
  });

  it('[PWSB] throws PryvError with structured fields on bogus reset token', async function () {
    this.timeout(15000);
    let caught;
    try {
      await service.resetPassword(
        testData.username,
        testData.password + 'X',
        'bogus-reset-token-' + cuid().slice(0, 8),
        'jslib-test'
      );
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(pryv.PryvError);
    expect(caught.status).to.be.gte(400);
    expect(caught.response).to.have.property('status');
  });
});
