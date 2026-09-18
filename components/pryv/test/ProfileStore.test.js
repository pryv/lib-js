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
});
