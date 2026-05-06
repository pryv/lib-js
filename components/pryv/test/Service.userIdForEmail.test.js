/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

describe('[UEMX] Service.userIdForEmail', function () {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
  });

  it('[UEMA] returns the username for a known email', async function () {
    this.timeout(15000);
    const service = new pryv.Service(testData.serviceInfoUrl);
    const knownEmail = testData.username + '@pryv.io';
    const userId = await service.userIdForEmail(knownEmail);
    expect(userId).to.equal(testData.username);
  });

  it('[UEMB] returns null for an unknown email', async function () {
    this.timeout(15000);
    const service = new pryv.Service(testData.serviceInfoUrl);
    const unknownEmail = 'ghost-' + cuid().slice(0, 12) + '@example.com';
    const userId = await service.userIdForEmail(unknownEmail);
    expect(userId).to.equal(null);
  });
});
