/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const ProfileStore = require('../src/Auth/ProfileStore');

const parent = { username: 'parent-doe', apiEndpoint: 'https://tok1@parent-doe.example.com/' };
const kim = { username: 'kim-doe', apiEndpoint: 'https://tok2@kim-doe.example.com/', actingAs: { username: 'kim-doe', delegate: 'parent-doe' } };

describe('[PSTX] ProfileStore', function () {
  it('[PSTA] reads stored data of any version: nothing, deleted, a single account, several', function () {
    expect(ProfileStore.read(null)).to.deep.equal({ active: null, profiles: [], authUrl: undefined });
    expect(ProfileStore.read({ deleted: true }).profiles).to.deep.equal([]);
    // a single account, as stored before profiles existed
    const legacy = ProfileStore.read({ apiEndpoint: parent.apiEndpoint, username: parent.username, authUrl: 'https://ui.example.com/auth' });
    expect(legacy.active).to.deep.equal(parent);
    expect(legacy.profiles).to.deep.equal([parent]);
    expect(legacy.authUrl).to.equal('https://ui.example.com/auth');
    // the active account always comes first, once
    const several = ProfileStore.read(Object.assign({}, kim, { profiles: [parent, kim] }));
    expect(several.active).to.deep.equal(kim);
    expect(several.profiles).to.deep.equal([kim, parent]);
    // remembered accounts, none active
    const none = ProfileStore.read({ profiles: [parent, kim] });
    expect(none.active).to.equal(null);
    expect(none.profiles).to.have.lengthOf(2);
  });

  it('[PSTB] activating keeps the most recent first, replaces the same username, and forgets beyond the limit', function () {
    let store = ProfileStore.read(null);
    store = ProfileStore.activate(store, parent);
    store = ProfileStore.activate(store, kim);
    expect(store.active.username).to.equal('kim-doe');
    expect(store.profiles.map((p) => p.username)).to.deep.equal(['kim-doe', 'parent-doe']);
    // a new sign-in to a remembered account replaces it (new token, flags cleared)
    store = ProfileStore.markUnavailable(store, 'parent-doe');
    store = ProfileStore.activate(store, Object.assign({}, parent, { apiEndpoint: 'https://tok3@parent-doe.example.com/' }));
    expect(store.profiles).to.deep.equal([
      { username: 'parent-doe', apiEndpoint: 'https://tok3@parent-doe.example.com/' },
      kim
    ]);
    // the least recently used account goes first; the active one stays
    for (let i = 0; i < 6; i++) {
      store = ProfileStore.activate(store, { username: 'u' + i, apiEndpoint: 'https://t@u' + i + '.example.com/' }, 3);
    }
    expect(store.profiles.map((p) => p.username)).to.deep.equal(['u5', 'u4', 'u3']);
    expect(ProfileStore.activate(store, parent).profiles).to.have.lengthOf(ProfileStore.DEFAULT_LIMIT - 1);
  });

  it('[PSTC] the stored form keeps the active account at the top level, readable by versions without profiles', function () {
    const store = ProfileStore.activate(ProfileStore.activate(ProfileStore.read(null), parent), kim);
    const data = ProfileStore.write(Object.assign(store, { authUrl: 'https://ui.example.com/auth' }));
    expect(data.username).to.equal('kim-doe');
    expect(data.apiEndpoint).to.equal(kim.apiEndpoint);
    expect(data.actingAs).to.deep.equal(kim.actingAs);
    expect(data.authUrl).to.equal('https://ui.example.com/auth');
    expect(data.profiles).to.deep.equal([kim, parent]);
    // no active account: no top-level credentials, so nothing signs in on reload
    const loggedOut = ProfileStore.write(ProfileStore.remove(store, 'kim-doe'));
    expect(loggedOut.username).to.equal(undefined);
    expect(loggedOut.apiEndpoint).to.equal(undefined);
    expect(loggedOut.profiles).to.deep.equal([parent]);
    expect(ProfileStore.write(ProfileStore.read(null))).to.equal(null);
    // unknown fields are not stored
    const extra = ProfileStore.write(ProfileStore.activate(ProfileStore.read(null), Object.assign({ token: 'x', other: 1 }, parent)));
    expect(extra.profiles[0]).to.deep.equal(parent);
  });

  it('[PSTD] a revoked account stays listed as unavailable and is no longer active', function () {
    const store = ProfileStore.markUnavailable(ProfileStore.activate(ProfileStore.activate(ProfileStore.read(null), parent), kim), 'kim-doe');
    expect(store.active).to.equal(null);
    expect(store.profiles.find((p) => p.username === 'kim-doe').unavailable).to.equal(true);
    const reread = ProfileStore.read(ProfileStore.write(store));
    expect(reread.active).to.equal(null);
    expect(reread.profiles.find((p) => p.username === 'kim-doe').unavailable).to.equal(true);
  });

  it('[PSTE] an ACCEPTED body marks the account as used through delegation only when its hint names that account', function () {
    const hint = { isDelegatedAccess: true, controlledUsername: 'kim-doe', delegate: { username: 'parent-doe' } };
    expect(ProfileStore.fromAccepted({ username: 'kim-doe', apiEndpoint: kim.apiEndpoint, delegation: hint })).to.deep.equal(kim);
    expect(ProfileStore.fromAccepted({ username: 'parent-doe', apiEndpoint: parent.apiEndpoint })).to.deep.equal(parent);
    // a hint about another account is ignored
    expect(ProfileStore.fromAccepted({ username: 'lou-doe', apiEndpoint: 'https://t@lou.example.com/', delegation: hint }).actingAs).to.equal(undefined);
    expect(ProfileStore.fromAccepted({ username: 'kim-doe', apiEndpoint: kim.apiEndpoint, delegation: { controlledUsername: 'kim-doe', delegate: { username: 'p' } } }).actingAs).to.equal(undefined);
  });

  it('[PSTF] the platform is the service information URL given, in one spelling, never its content', function () {
    const of = (url, info) => ProfileStore.platformOf({ _serviceInfoUrl: url, infoSync: () => info ?? { access: 'https://a.example/', serial: '1' } });
    const base = 'https://p.example/service/info';
    expect(of(base)).to.equal(base);
    expect(of('HTTPS://P.example:443/x/../service/info#frag')).to.equal(base);
    for (const other of [base + '/', base + '?a=1', 'https://p.example/service/infos', 'https://q.example/service/info', 'http://p.example/service/info', 'https://p.example:8443/service/info']) {
      expect(of(other), other).to.not.equal(base);
    }
    expect(of(null)).to.equal('inline:https://a.example/');
    expect(of('', null)).to.equal('inline:https://a.example/');
    expect(ProfileStore.platformOf({ infoSync: () => null })).to.equal('inline:');
    expect(of('not a url ::')).to.be.a('string');
  });

  it('[PSTG] stored data names its platform; it belongs to that one only, or to the one in use when it names none and is adopted', function () {
    const data = ProfileStore.write({ active: parent, profiles: [parent], platform: 'https://p.example/i' });
    expect(data.platform).to.equal('https://p.example/i');
    expect(ProfileStore.read(data).platform).to.equal('https://p.example/i');
    expect(ProfileStore.read(parent)).to.not.have.property('platform');
    for (const adopt of [true, false]) {
      expect(ProfileStore.forPlatform(data, 'https://p.example/i', adopt)).to.equal(data);
      expect(ProfileStore.forPlatform(data, 'https://q.example/i', adopt)).to.equal(null);
      expect(ProfileStore.forPlatform(null, 'https://p.example/i', adopt)).to.equal(null);
      expect(ProfileStore.forPlatform('text', 'https://p.example/i', adopt)).to.equal(null);
    }
    expect(ProfileStore.forPlatform(parent, 'https://p.example/i', true)).to.equal(parent);
    expect(ProfileStore.forPlatform(parent, 'https://p.example/i', false)).to.equal(null);
  });
});
