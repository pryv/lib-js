/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

describe('[CRUX] Service.createUser', function () {
  let service;
  let hostingKey;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    service = new pryv.Service(testData.serviceInfoUrl);
    const serviceInfo = await service.info();
    // Discover any available hosting key — equivalent to what the deferred
    // 1.4 `flatHostings()` will eventually do.
    const res = await fetch(serviceInfo.register + 'hostings');
    const tree = await res.json();
    hostingKey = findFirstAvailableHostingKey(tree);
    if (!hostingKey) this.skip();
  });

  it('[CRUA] rejects when required fields are missing', async function () {
    let caught;
    try {
      await service.createUser({ username: 'foo' });
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(pryv.PryvError);
    expect(caught.message).to.match(/createUser requires/);
  });

  it('[CRUB] creates a fresh user and returns username + apiEndpoint', async function () {
    this.timeout(20000);
    const username = 'jslibcr' + cuid().slice(0, 8);
    const result = await service.createUser({
      username,
      password: username + 'PASS!1',
      email: username + '@example.com',
      hosting: hostingKey,
      appId: 'jslib-test',
      language: 'en'
    });
    expect(result.username).to.equal(username);
    expect(result.apiEndpoint).to.be.a('string');
    expect(result.apiEndpoint).to.include(username);

    // Sanity: the new user can be looked up
    const exists = await service.userExists(username);
    expect(exists).to.equal(true);
  });

  it('[CRUC] throws PryvError when re-creating an existing user', async function () {
    this.timeout(20000);
    let caught;
    try {
      await service.createUser({
        username: testData.username,
        password: testData.password,
        email: testData.username + '@pryv.io',
        hosting: hostingKey,
        appId: 'jslib-test'
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(pryv.PryvError);
    expect(caught.status).to.be.gte(400);
    // Server-side validation order varies; we don't pin the exact id.
    expect(caught.response).to.have.property('status');
  });
});

function findFirstAvailableHostingKey (tree) {
  const regions = (tree && tree.regions) || {};
  for (const region of Object.values(regions)) {
    const zones = region.zones || {};
    for (const zone of Object.values(zones)) {
      const hostings = zone.hostings || {};
      for (const [key, h] of Object.entries(hostings)) {
        if (h && h.available) return key;
      }
    }
  }
  return null;
}
