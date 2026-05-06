/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

describe('[USRX] Service.userExists', function () {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
  });

  it('[USRA] returns true for a registered user', async function () {
    this.timeout(15000);
    const service = new pryv.Service(testData.serviceInfoUrl);
    const exists = await service.userExists(testData.username);
    expect(exists).to.equal(true);
  });

  it('[USRB] returns false for an unknown user (404)', async function () {
    this.timeout(15000);
    const service = new pryv.Service(testData.serviceInfoUrl);
    const fakeUser = 'no-' + cuid().slice(0, 12);
    const exists = await service.userExists(fakeUser);
    expect(exists).to.equal(false);
  });
});
