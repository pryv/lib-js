/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

describe('[HSTX] Service.availableHostings + flatHostings', function () {
  let service;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    service = new pryv.Service(testData.serviceInfoUrl);
  });

  it('[HSTA] availableHostings() returns the raw regions tree', async function () {
    this.timeout(15000);
    const tree = await service.availableHostings();
    expect(tree).to.be.an('object');
    expect(tree.regions).to.be.an('object');
    // At least one region with at least one zone with at least one hosting
    const regions = Object.values(tree.regions);
    expect(regions.length).to.be.gte(1);
  });

  it('[HSTB] flatHostings() returns a list with key/name/region/zone fields', async function () {
    this.timeout(15000);
    const list = await service.flatHostings();
    expect(list).to.be.an('array');
    expect(list.length).to.be.gte(1);
    for (const item of list) {
      expect(item.key).to.be.a('string');
      expect(item.name).to.be.a('string');
      expect(item.region).to.be.a('string');
      expect(item.zone).to.be.a('string');
      expect(item.availableCore).to.be.a('string');
      expect(item.available).to.be.a('boolean');
    }
  });

  it('[HSTC] flatHostings() shape matches availableHostings() leaf nodes', async function () {
    this.timeout(15000);
    const tree = await service.availableHostings();
    const flat = await service.flatHostings();
    let leafCount = 0;
    for (const region of Object.values(tree.regions || {})) {
      for (const zone of Object.values(region.zones || {})) {
        leafCount += Object.keys(zone.hostings || {}).length;
      }
    }
    expect(flat.length).to.equal(leafCount);
  });
});
