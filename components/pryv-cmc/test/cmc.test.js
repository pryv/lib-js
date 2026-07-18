/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect, beforeEach */

const cmc = require('../src');

describe('[CMCX] @pryv/cmc Level-0 helpers', function () {
  describe('[CMCXC] constants', function () {
    it('[CMCXCA] exposes namespace + event-type constants', function () {
      expect(cmc.NS).to.equal(':_cmc:');
      expect(cmc.NS_INBOX).to.equal(':_cmc:inbox');
      expect(cmc.NS_APPS).to.equal(':_cmc:apps');
      expect(cmc.NS_INTERNAL).to.equal(':_cmc:_internal');
      expect(cmc.NS_INTERNAL_RETRIES).to.equal(':_cmc:_internal:retries');
      expect(cmc.ET_REQUEST).to.equal('consent/request-cmc');
      expect(cmc.ET_ACCEPT).to.equal('consent/accept-cmc');
      expect(cmc.ET_CHAT).to.equal('message/chat-cmc');
      expect(cmc.ET_SYSTEM_ALERT).to.equal('notification/alert-cmc');
      expect(cmc.EVENT_TYPES_LIFECYCLE).to.include('consent/request-cmc');
      expect(cmc.EVENT_TYPES_SYSTEM).to.include('consent/scope-update-cmc');
    });
  });

  describe('[CMCXS] slug helpers', function () {
    it('[CMCXSA] slugifyHost lowercases + replaces dots with hyphens', function () {
      expect(cmc.slugifyHost('PRYV.me')).to.equal('pryv-me');
      expect(cmc.slugifyHost('a.b.c.example.org')).to.equal('a-b-c-example-org');
    });

    it('[CMCXSB] counterpartySlug joins username + host-slug with --', function () {
      expect(cmc.counterpartySlug({ username: 'alice', host: 'pryv.me' }))
        .to.equal('alice--pryv-me');
      expect(cmc.counterpartySlug({ username: 'provider-a', host: 'example.com' }))
        .to.equal('provider-a--example-com');
    });

    it('[CMCXSC] counterpartySlug rejects invalid pieces', function () {
      expect(() => cmc.counterpartySlug({ username: 'has space', host: 'a.b' })).to.throw();
      expect(() => cmc.counterpartySlug({ username: '', host: 'a.b' })).to.throw();
      expect(() => cmc.counterpartySlug({ username: 'a--b', host: 'a.b' })).to.throw();
    });

    it('[CMCXSD] parseCounterpartySlug round-trips the slug', function () {
      const s = cmc.counterpartySlug({ username: 'alice', host: 'pryv.me' });
      const parsed = cmc.parseCounterpartySlug(s);
      expect(parsed).to.deep.equal({ username: 'alice', hostSlug: 'pryv-me' });
    });

    it('[CMCXSE] parseCounterpartySlug rejects malformed input', function () {
      expect(() => cmc.parseCounterpartySlug('no-separator')).to.throw();
      expect(() => cmc.parseCounterpartySlug('a--b--c')).to.throw();
      expect(() => cmc.parseCounterpartySlug('')).to.throw();
    });
  });

  describe('[CMCXB] stream-id builders', function () {
    it('[CMCXBA] appScope produces :_cmc:apps:<app-code>', function () {
      expect(cmc.appScope('my-app')).to.equal(':_cmc:apps:my-app');
    });

    it('[CMCXBB] chats helpers build the nested path', function () {
      const scope = cmc.appScope('my-app');
      expect(cmc.chatsParentUnder(scope)).to.equal(':_cmc:apps:my-app:chats');
      const slug = cmc.counterpartySlug({ username: 'alice', host: 'pryv.me' });
      expect(cmc.chatStreamUnder(scope, slug)).to.equal(':_cmc:apps:my-app:chats:alice--pryv-me');
    });

    it('[CMCXBC] collectors helpers build the nested path', function () {
      const scope = ':_cmc:apps:my-app:campaign-2026';
      expect(cmc.collectorsParentUnder(scope)).to.equal(':_cmc:apps:my-app:campaign-2026:collectors');
      expect(cmc.collectorStreamUnder(scope, 'alice--pryv-me'))
        .to.equal(':_cmc:apps:my-app:campaign-2026:collectors:alice--pryv-me');
    });
  });

  describe('[CMCXP] predicates + parsers', function () {
    it('[CMCXPA] isCmcStreamId true for :_cmc:* + false for non-cmc', function () {
      expect(cmc.isCmcStreamId(':_cmc:apps:foo')).to.equal(true);
      expect(cmc.isCmcStreamId(':_cmc:inbox')).to.equal(true);
      expect(cmc.isCmcStreamId('fertility')).to.equal(false);
      expect(cmc.isCmcStreamId(':_system:account:email')).to.equal(false);
    });

    it('[CMCXPB] isAppNestedPluginStream true for chats/collectors leaves', function () {
      expect(cmc.isAppNestedPluginStream(':_cmc:apps:my-app:chats:alice--pryv-me')).to.equal(true);
      expect(cmc.isAppNestedPluginStream(':_cmc:apps:my-app:collectors:alice--pryv-me')).to.equal(true);
      expect(cmc.isAppNestedPluginStream(':_cmc:apps:my-app:study-A:chats')).to.equal(true);
      expect(cmc.isAppNestedPluginStream(':_cmc:apps:my-app:study-A')).to.equal(false);
      expect(cmc.isAppNestedPluginStream(':_cmc:apps:my-app:chats-style-data')).to.equal(false);
    });

    it('[CMCXPC] getAppCode pulls the app segment', function () {
      expect(cmc.getAppCode(':_cmc:apps:my-app')).to.equal('my-app');
      expect(cmc.getAppCode(':_cmc:apps:my-app:campaign-2026')).to.equal('my-app');
      expect(cmc.getAppCode(':_cmc:inbox')).to.equal(null);
      expect(cmc.getAppCode('fertility')).to.equal(null);
    });

    it('[CMCXPD] parseChatStreamId extracts scope + counterparty', function () {
      const r = cmc.parseChatStreamId(':_cmc:apps:my-app:campaign-2026:chats:alice--pryv-me');
      expect(r.appCode).to.equal('my-app');
      expect(r.scopeStreamId).to.equal(':_cmc:apps:my-app:campaign-2026');
      expect(r.counterpartySlug).to.equal('alice--pryv-me');
      expect(r.counterparty).to.deep.equal({ username: 'alice', hostSlug: 'pryv-me' });
    });

    it('[CMCXPE] parseChatStreamId returns null for non-chat ids', function () {
      expect(cmc.parseChatStreamId(':_cmc:inbox')).to.equal(null);
      expect(cmc.parseChatStreamId(':_cmc:apps:my-app:collectors:foo--bar')).to.equal(null);
      expect(cmc.parseChatStreamId('arbitrary-stream')).to.equal(null);
    });

    it('[CMCXPF] parseCollectorStreamId extracts scope + counterparty', function () {
      const r = cmc.parseCollectorStreamId(':_cmc:apps:my-app:collectors:alice--pryv-me');
      expect(r.appCode).to.equal('my-app');
      expect(r.scopeStreamId).to.equal(':_cmc:apps:my-app');
      expect(r.counterpartySlug).to.equal('alice--pryv-me');
    });

    it('[CMCXPG] parseCollectorStreamId returns null for non-collector ids', function () {
      expect(cmc.parseCollectorStreamId(':_cmc:apps:my-app:chats:foo--bar')).to.equal(null);
      expect(cmc.parseCollectorStreamId(':_cmc:apps:my-app:collectors:no-separator')).to.equal(null);
    });
  });

  describe('[CMCXE] errorIds catalogue', function () {
    it('[CMCXEA] is frozen + exposes capability + handler reasons', function () {
      expect(cmc.errorIds).to.be.frozen;
      expect(cmc.errorIds.CAPABILITY_INVALID).to.equal('cmc-capability-invalid');
      expect(cmc.errorIds.CAPABILITY_CONSUMED).to.equal('cmc-capability-consumed');
      expect(cmc.errorIds.CAPABILITY_INVALIDATED).to.equal('cmc-capability-invalidated');
      expect(cmc.errorIds.CAPABILITY_ALREADY_ACCEPTED_BY_YOU).to.equal('cmc-capability-already-accepted-by-you');
      expect(cmc.errorIds.HANDLER_DELIVERY_FAILED).to.equal('cmc-handler-delivery-failed');
      expect(cmc.errorIds.CHAT_NO_REMOTE_APIENDPOINT).to.equal('cmc-chat-no-remote-apiendpoint');
    });

    it('[CMCXEB] does not carry the dropped CHAT_RATE_LIMITED', function () {
      expect(cmc.errorIds).to.not.have.property('CHAT_RATE_LIMITED');
    });

    it('[CMCXEC] J9 catalogue mirrors @pryv/cmc 1.1.0 server-side additions', function () {
      // Server-side errorIds shipped in open-pryv.io 2.0.0-pre.4 / cmc
      // plugin commit 0306c7e. SDK must expose the same kebab strings so
      // apps can pattern-match without parsing message text.
      expect(cmc.errorIds.CAPABILITY_TTL_OUT_OF_RANGE).to.equal('cmc-capability-ttl-out-of-range');
      expect(cmc.errorIds.CHAT_DISABLED).to.equal('cmc-chat-disabled');
      expect(cmc.errorIds.SYSTEM_MESSAGING_DISABLED).to.equal('cmc-system-messaging-disabled');
      expect(cmc.errorIds.CLIENTDATA_CMC_FORBIDDEN).to.equal('cmc-clientdata-cmc-forbidden');
      expect(cmc.errorIds.RESERVED_STREAM_UNDELETABLE).to.equal('cmc-reserved-stream-undeletable');
      expect(cmc.errorIds.COUNTERPARTY_IDENTITY_MISSING).to.equal('cmc-counterparty-identity-missing');
      expect(cmc.errorIds.HANDLER_MISSING_CAPABILITY_ID).to.equal('cmc-handler-missing-capability-id');
    });
  });
});

// --- Level-1 protocol functions ---

/**
 * Stub Connection — records (method, params) calls and replays canned
 * responses from a queue or a per-method handler. Mirrors enough of the
 * real `pryv.Connection.apiOne` surface for unit tests:
 *   apiOne(method, params, expectedKey)
 * Returns `result[expectedKey]` (or the full result if no key).
 */
function makeStubConnection (options) {
  options = options || {};
  const handlers = options.handlers || {};
  const calls = [];
  return {
    calls,
    async apiOne (method, params, expectedKey) {
      calls.push({ method, params, expectedKey });
      const handler = handlers[method];
      if (handler == null) {
        throw new Error('stubConnection: no handler for method "' + method + '"');
      }
      const result = typeof handler === 'function' ? await handler(params, calls.length - 1) : handler;
      if (result && result.error) throw result.error;
      if (expectedKey != null) return result[expectedKey];
      return result;
    },
    async api (apiCalls) {
      const out = [];
      for (const c of apiCalls) {
        try {
          const r = await this.apiOne(c.method, c.params);
          out.push(r);
        } catch (e) {
          out.push({ error: { message: e.message } });
        }
      }
      return out;
    }
  };
}

describe('[CMCL1] @pryv/cmc Level-1 protocol functions', function () {
  describe('[CMCL1I] createInvite', function () {
    it('[CMCL1IA] posts a consent/request-cmc with capabilityRequested:true', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return {
              event: {
                id: 'evt-001',
                streamIds: params.streamIds,
                type: params.type,
                content: Object.assign({}, params.content, {
                  capabilityUrl: 'https://t0k3n@alice.example.com/',
                  capabilityExpiresAt: 1735776000,
                  status: 'pending'
                })
              }
            };
          }
        }
      });
      const res = await cmc.createInvite(conn, {
        appCode: 'my-app',
        scopeStreamId: ':_cmc:apps:my-app:study-A',
        displayName: 'Provider A',
        requestedPermissions: [{ streamId: 'fertility', level: 'read' }]
      });
      expect(conn.calls).to.have.length(1);
      expect(conn.calls[0].method).to.equal('events.create');
      expect(conn.calls[0].params.type).to.equal('consent/request-cmc');
      expect(conn.calls[0].params.content.capabilityRequested).to.equal(true);
      expect(conn.calls[0].params.content.request.permissions).to.deep.equal([{ streamId: 'fertility', level: 'read' }]);
      expect(conn.calls[0].params.content.requesterMeta.displayName).to.equal('Provider A');
      expect(conn.calls[0].params.content.requesterMeta.appId).to.equal('my-app');
      expect(res.inviteEventId).to.equal('evt-001');
      expect(res.capabilityUrl).to.equal('https://t0k3n@alice.example.com/');
      expect(res.mode).to.equal('single-use');
      expect(res.expiresAt).to.equal(1735776000);
    });

    it('[CMCL1IAT] passes accessType through to request.accessType (delegable app grant)', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'evt-at', streamIds: params.streamIds, content: Object.assign({}, params.content, { capabilityUrl: 'https://t@x/' }) } };
          }
        }
      });
      await cmc.createInvite(conn, {
        appCode: 'my-app', scopeStreamId: ':_cmc:apps:my-app', displayName: 'P',
        requestedPermissions: [{ streamId: 'body', level: 'manage' }],
        accessType: 'app'
      });
      expect(conn.calls[0].params.content.request.accessType).to.equal('app');
    });

    it('[CMCL1IATD] omits accessType when not provided (server defaults to shared)', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'evt-atd', streamIds: params.streamIds, content: Object.assign({}, params.content, { capabilityUrl: 'https://t@x/' }) } };
          }
        }
      });
      await cmc.createInvite(conn, {
        appCode: 'my-app', scopeStreamId: ':_cmc:apps:my-app', displayName: 'P',
        requestedPermissions: [{ streamId: 'body', level: 'read' }]
      });
      expect(conn.calls[0].params.content.request).to.not.have.property('accessType');
    });

    it('[CMCL1IB] open-link mode propagates capability.mode', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return {
              event: {
                id: 'evt-002',
                streamIds: params.streamIds,
                content: Object.assign({}, params.content, {
                  capabilityUrl: 'https://...@x/',
                  capabilityExpiresAt: 1
                })
              }
            };
          }
        }
      });
      const res = await cmc.createInvite(conn, {
        appCode: 'my-app',
        scopeStreamId: ':_cmc:apps:my-app',
        displayName: 'P',
        requestedPermissions: [],
        mode: 'open-link'
      });
      expect(conn.calls[0].params.content.capability).to.deep.equal({ mode: 'open-link' });
      expect(res.mode).to.equal('open-link');
    });
  });

  describe('[CMCL1L] listInvites', function () {
    it('[CMCL1LA] uses default scope + maps events to records', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function (params) {
            expect(params.types).to.deep.equal(['consent/request-cmc']);
            return {
              events: [{
                id: 'evt-a',
                streamIds: [':_cmc:apps:my-app'],
                content: {
                  capabilityUrl: 'https://x/',
                  status: 'pending',
                  capabilityExpiresAt: 1234
                }
              }]
            };
          }
        }
      });
      const r = await cmc.listInvites(conn);
      expect(conn.calls[0].params.streams).to.deep.equal([':_cmc:apps']);
      expect(r.items).to.have.length(1);
      expect(r.items[0].inviteEventId).to.equal('evt-a');
      expect(r.items[0].status).to.equal('pending');
      expect(r.truncated).to.equal(false);
    });

    it('[CMCL1LB] truncated:true when count matches limit', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return { events: [{ id: '1', streamIds: ['a'], content: {} }, { id: '2', streamIds: ['a'], content: {} }] };
          }
        }
      });
      const r = await cmc.listInvites(conn, { limit: 2 });
      expect(r.truncated).to.equal(true);
    });
  });

  describe('[CMCL1O] readOffer', function () {
    /**
     * Build a fake `pryv` module that returns a connection-like stub
     * for `new pryv.Connection(url)`. The stub records every apiOne
     * call so we can assert its wire-shape (Pryv's events.get takes
     * `streams` — NOT `streamIds`, which is the write target on
     * events.create. The api-server schema rejects the wrong field with
     * `OBJECT_ADDITIONAL_PROPERTIES`).
     *
     * Bug history: readOffer used to call events.get with
     * `streamIds: [...]`, which the api-server rejected at the schema
     * layer — every `cmc.readOffer(url)` threw on the first await.
     * Existing unit tests passed only because they exercised
     * `acceptInvite` (which catches readOffer errors silently) and
     * never asserted on the wire-shape of the inner call.
     */
    function fakePryvWithApiOne (apiOneFn) {
      const stub = {
        apiOne: apiOneFn,
        service: { info: async () => { throw new Error('not stubbed'); } },
        accessInfo: async () => { throw new Error('not stubbed'); }
      };
      return {
        Connection: function () { return stub; },
        utils: { decomposeAPIEndpoint: () => ({ username: null, host: '' }) },
        _stub: stub
      };
    }

    it('[CMCL1OA] calls events.get WITHOUT a streams filter — relies on capability-access permissions to narrow the response', async function () {
      // Bug history (two PRs back-to-back):
      //   1. PR #67 fixed `streamIds → streams` (api-server schema rejects
      //      `streamIds` on events.get with OBJECT_ADDITIONAL_PROPERTIES).
      //   2. PR #68 fixed the resulting `unknown-referenced-resource` —
      //      the parent stream `:_cmc:_internal:offer` is NOT
      //      auto-provisioned on every user account (only the
      //      per-capability children `:_cmc:_internal:offer:<capId>` are,
      //      and the accepter doesn't know <capId> from the capabilityUrl).
      //      The capability access's permissions already narrow the
      //      response to the one offer event this token can read; a
      //      streams filter at the request level is wrong.
      //
      // Contract: events.get is called WITHOUT a `streams` field (and
      // without the typo `streamIds`). The `types` filter is kept as
      // defense in case the offer stream ever holds more than one event
      // in future revisions.
      const calls = [];
      const fakePryv = fakePryvWithApiOne(async function (method, params, expectedKey) {
        calls.push({ method, params, expectedKey });
        if (method === 'events.get') {
          return { events: [{ id: 'offer-1', content: { request: { permissions: [], consent: { en: 'ok' } }, requesterMeta: { displayName: 'X' } } }] }[expectedKey];
        }
        throw new Error('unexpected method: ' + method);
      });
      await cmc.readOffer('https://Tok@example.com/', { pryv: fakePryv });
      const getCall = calls.find(function (c) { return c.method === 'events.get'; });
      expect(getCall, 'expected one events.get call').to.exist;
      expect(getCall.params).to.not.have.property('streams');
      expect(getCall.params).to.not.have.property('streamIds');
      expect(getCall.params).to.have.property('types');
      expect(getCall.params.types).to.deep.equal(['consent/request-cmc']);
    });
  });

  describe('[CMCL1G] getInviteStatus', function () {
    it('[CMCL1GA] reads events.getOne by id and returns InviteRecord', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.getOne': function (params) {
            expect(params.id).to.equal('evt-1');
            return {
              event: {
                id: 'evt-1',
                streamIds: [':_cmc:apps:my-app'],
                content: { capabilityUrl: 'https://x/', status: 'completed', capabilityExpiresAt: 9 }
              }
            };
          }
        }
      });
      const r = await cmc.getInviteStatus(conn, 'evt-1');
      expect(r.status).to.equal('completed');
      expect(r.inviteEventId).to.equal('evt-1');
    });
  });

  describe('[CMCL1R] revokeRelationship / revokeAcceptance', function () {
    it('[CMCL1RA] revokeRelationship posts consent/revoke-cmc with accessId', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            expect(params.type).to.equal('consent/revoke-cmc');
            return { event: { id: 'rev-1', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      await cmc.revokeRelationship(conn, {
        scopeStreamId: ':_cmc:apps:my-app',
        accessId: 'abc123',
        reason: { en: 'done' }
      });
      expect(conn.calls[0].params.content).to.deep.equal({ accessId: 'abc123', reason: { en: 'done' } });
    });

    it('[CMCL1RC] revokeRelationship({inviteEventId}) resolves backChannelAccessId via inbox lookup', async function () {
      // Doctor-side convenience path: the SDK looks up the inbox accept
      // event matching the original inviteEventId, reads the back-channel
      // accessId stamped by the plugin (post-PR-72 + Phase 1.1 of Plan
      // 68 atwork — handleIncomingAccept now stamps `inviteEventId` on
      // the inbox-mirror from the capability access's
      // `clientData.cmc.requestEventId`). Then issues the revoke.
      //
      // Contract: the lookup matches when the inbox event content carries
      // `inviteEventId === givenInviteEventId`. The backChannelAccessId
      // stamped by the plugin (also a PR #72 deliverable) is what
      // becomes `content.accessId` on the revoke event.
      const conn = makeStubConnection({
        handlers: {
          'events.getOne': function (params) {
            expect(params.id).to.equal('inv-trigger-42');
            return { event: { id: 'inv-trigger-42', streamIds: [':_cmc:apps:my-app:study-1'], content: {} } };
          },
          'events.get': function (params) {
            // Lookup on :_cmc:inbox for ET_ACCEPT.
            expect(params.streams).to.deep.equal([':_cmc:inbox']);
            expect(params.types).to.deep.equal(['consent/accept-cmc']);
            return {
              events: [
                // Decoy: an unrelated accept.
                { id: 'inbox-other', content: { inviteEventId: 'inv-trigger-99', backChannelAccessId: 'acc-other' } },
                // Match: the one we're after.
                { id: 'inbox-42', content: { inviteEventId: 'inv-trigger-42', backChannelAccessId: 'acc-back-42' } }
              ]
            };
          },
          'events.create': function (params) {
            expect(params.type).to.equal('consent/revoke-cmc');
            return { event: { id: 'rev-3', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      await cmc.revokeRelationship(conn, { inviteEventId: 'inv-trigger-42', reason: { en: 'done' } });
      const revokeCall = conn.calls.find(function (c) { return c.method === 'events.create'; });
      expect(revokeCall, 'revoke events.create call must exist').to.exist;
      expect(revokeCall.params.streamIds).to.deep.equal([':_cmc:apps:my-app:study-1']);
      expect(revokeCall.params.content.accessId).to.equal('acc-back-42');
      expect(revokeCall.params.content.reason).to.deep.equal({ en: 'done' });
    });

    it('[CMCL1RD] revokeRelationship({inviteEventId}) throws when inbox has no matching accept (mirror missing inviteEventId)', async function () {
      // Defensive: the pre-Phase-1.1 plugin doesn't stamp inviteEventId
      // on the inbox mirror. The SDK lookup falls through to `match ==
      // null` and throws cleanly — caller can fall back to the
      // {accessId, scopeStreamId} power-user path.
      const conn = makeStubConnection({
        handlers: {
          'events.getOne': function () {
            return { event: { id: 'inv-trigger-99', streamIds: [':_cmc:apps:my-app'], content: {} } };
          },
          'events.get': function () {
            return {
              events: [
                // Mirror present but without inviteEventId — older plugin shape.
                { id: 'inbox-99', content: { backChannelAccessId: 'acc-back-99' } }
              ]
            };
          }
        }
      });
      let err = null;
      try { await cmc.revokeRelationship(conn, { inviteEventId: 'inv-trigger-99' }); } catch (e) { err = e; }
      expect(err, 'expected throw').to.exist;
      expect(err.message).to.match(/no inbox accept found/);
    });

    it('[CMCL1RB] revokeAcceptance also posts consent/revoke-cmc', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            expect(params.type).to.equal('consent/revoke-cmc');
            return { event: { id: 'rev-2', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      await cmc.revokeAcceptance(conn, {
        scopeStreamId: ':_cmc:apps:patient:incoming',
        accessId: 'def456'
      });
      expect(conn.calls).to.have.length(1);
    });
  });

  describe('[CMCL1V] invalidateCapability', function () {
    it('[CMCL1VA] looks up capabilityId on trigger + posts invalidate-link', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.getOne': function () {
            return { event: { id: 'inv-1', streamIds: [':_cmc:apps:my-app'], content: { capabilityId: 'cap-xyz' } } };
          },
          'events.create': function (params) {
            return { event: { id: 'inv-x', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      await cmc.invalidateCapability(conn, { inviteEventId: 'inv-1', reason: { en: 'closed' } });
      expect(conn.calls).to.have.length(2);
      expect(conn.calls[1].params.type).to.equal('consent/invalidate-link-cmc');
      expect(conn.calls[1].params.content.capabilityId).to.equal('cap-xyz');
      expect(conn.calls[1].params.streamIds).to.deep.equal([':_cmc:apps:my-app']);
    });

    it('[CMCL1VB] throws when invite event lacks capabilityId', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.getOne': function () {
            return { event: { id: 'inv-2', streamIds: [':a'], content: {} } };
          }
        }
      });
      let err = null;
      try {
        await cmc.invalidateCapability(conn, { inviteEventId: 'inv-2' });
      } catch (e) { err = e; }
      expect(err).to.exist;
      expect(err.message).to.match(/capabilityId/);
    });
  });

  describe('[CMCL1S] proposeScopeUpdate', function () {
    it('[CMCL1SA] posts consent/scope-request-cmc with newPermissions', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 's-1', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      const r = await cmc.proposeScopeUpdate(conn, {
        collectorStreamId: ':_cmc:apps:my-app:study-A:collectors:alice--pryv-me',
        newPermissions: [{ streamId: 'sleep', level: 'read' }],
        message: { en: 'plus sleep please' }
      });
      expect(conn.calls[0].params.type).to.equal('consent/scope-request-cmc');
      expect(r.scopeRequestEventId).to.equal('s-1');
    });
  });

  describe('[CMCL1A] acceptInvite + refuseInvite', function () {
    it('[CMCL1AA] waitForCompletion:false returns immediately as pending', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'acc-1', streamIds: params.streamIds, content: { status: 'pending' } } };
          }
        }
      });
      const r = await cmc.acceptInvite(conn, 'http://127.0.0.1:0/invalid/', { scopeStreamId: ':_cmc:apps:test', waitForCompletion: false });
      expect(r.acceptEventId).to.equal('acc-1');
      expect(r.dataGrantAccessId).to.equal(null);
      expect(r.status).to.equal('pending');
      expect(r.counterparty).to.deep.equal({ username: null, host: null, displayName: undefined });
      // 1 events.create. (Offer read attempt happens but on a separate
      // pryv.Connection over the bogus capability URL — silently fails.)
      expect(conn.calls).to.have.length(1);
    });

    it('[CMCL1AB] waitForCompletion polls until status=completed', async function () {
      // acceptInvite reads the OFFER (via a new pryv.Connection on the
      // capability URL) to derive counterparty identity. With a stub
      // capability URL the offer read fails silently → counterparty
      // defaults to nulls. dataGrantAccessId + features come from the
      // trigger event.
      let pollCount = 0;
      const conn = makeStubConnection({
        handlers: {
          'events.create': function () {
            return { event: { id: 'acc-2', content: { status: 'pending' } } };
          },
          'events.getOne': function () {
            pollCount += 1;
            if (pollCount < 2) return { event: { id: 'acc-2', content: { status: 'pending' } } };
            return {
              event: {
                id: 'acc-2',
                content: {
                  status: 'completed',
                  dataGrantAccessId: 'dg-1',
                  features: { chat: true }
                }
              }
            };
          }
        }
      });
      const r = await cmc.acceptInvite(conn, 'http://127.0.0.1:0/invalid/', { scopeStreamId: ':_cmc:apps:test', completionPollIntervalMs: 5, completionTimeoutMs: 1000 });
      expect(r.acceptEventId).to.equal('acc-2');
      expect(r.dataGrantAccessId).to.equal('dg-1');
      expect(r.counterparty).to.deep.equal({ username: null, host: null, displayName: undefined });
      expect(r.features).to.deep.equal({ chat: true });
    });

    it('[CMCL1AC] throws CmcError with errorIds reason on status=failed', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function () {
            return { event: { id: 'acc-3', content: { status: 'pending' } } };
          },
          'events.getOne': function () {
            return { event: { id: 'acc-3', content: { status: 'failed', failure: { reason: 'cmc-capability-consumed' } } } };
          }
        }
      });
      let err = null;
      try {
        await cmc.acceptInvite(conn, 'https://t@x/', { scopeStreamId: ':_cmc:apps:test', completionPollIntervalMs: 5, completionTimeoutMs: 1000 });
      } catch (e) { err = e; }
      expect(err).to.exist;
      expect(err).to.be.instanceOf(cmc.CmcError);
      expect(err.id).to.equal(cmc.errorIds.CAPABILITY_CONSUMED);
    });

    it('[CMCL1AD] refuseInvite posts consent/refuse-cmc', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'rf-1', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      const r = await cmc.refuseInvite(conn, 'https://t@x/', { scopeStreamId: ':_cmc:apps:test', reason: { en: 'no' } });
      expect(conn.calls[0].params.type).to.equal('consent/refuse-cmc');
      expect(r.refuseEventId).to.equal('rf-1');
    });
  });

  describe('[CMCL1C] cross-direction: chat / system / ack', function () {
    let conn;
    beforeEach(function () {
      conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'mk-' + conn.calls.length, streamIds: params.streamIds, content: params.content } };
          }
        }
      });
    });

    it('[CMCL1CA] sendChat posts message/chat-cmc to the chats stream', async function () {
      const r = await cmc.sendChat(conn, {
        scopeStreamId: ':_cmc:apps:my-app:study-A',
        peerSlug: 'alice--pryv-me',
        content: 'hello'
      });
      expect(conn.calls[0].params.streamIds).to.deep.equal([':_cmc:apps:my-app:study-A:chats:alice--pryv-me']);
      expect(conn.calls[0].params.type).to.equal('message/chat-cmc');
      expect(conn.calls[0].params.content).to.deep.equal({ content: 'hello' });
      expect(r.chatEventId).to.exist;
    });

    it('[CMCL1CB] sendSystemAlert posts notification/alert-cmc to the collectors stream', async function () {
      await cmc.sendSystemAlert(conn, {
        scopeStreamId: ':_cmc:apps:my-app',
        peerSlug: 'alice--pryv-me',
        level: 'warning',
        title: { en: 'T' },
        body: { en: 'B' },
        ackRequired: true,
        ackId: 'a-1'
      });
      expect(conn.calls[0].params.streamIds).to.deep.equal([':_cmc:apps:my-app:collectors:alice--pryv-me']);
      expect(conn.calls[0].params.type).to.equal('notification/alert-cmc');
      expect(conn.calls[0].params.content.level).to.equal('warning');
      expect(conn.calls[0].params.content.ackId).to.equal('a-1');
    });

    it('[CMCL1CC] sendSystemAck posts notification/ack-cmc with alertEventId+ackId', async function () {
      await cmc.sendSystemAck(conn, {
        scopeStreamId: ':_cmc:apps:my-app',
        peerSlug: 'alice--pryv-me',
        alertEventId: 'al-1',
        ackId: 'a-1'
      });
      expect(conn.calls[0].params.type).to.equal('notification/ack-cmc');
      expect(conn.calls[0].params.content).to.deep.equal({ alertEventId: 'al-1', ackId: 'a-1' });
    });
  });

  describe('[CMCL1U] acceptScopeUpdate / refuseScopeUpdate', function () {
    it('[CMCL1UA] acceptScopeUpdate posts scope-update-cmc with accept:true', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.getOne': function (params) {
            expect(params.id).to.equal('sr-1');
            return { event: { id: 'sr-1', streamIds: [':_cmc:apps:p:i:collectors:doctor--example-com'] } };
          },
          'events.create': function (params) {
            return { event: { id: 'up-1', streamIds: params.streamIds, content: Object.assign({}, params.content, { newAccessId: 'abc:2' }) } };
          }
        }
      });
      const r = await cmc.acceptScopeUpdate(conn, 'sr-1');
      expect(conn.calls).to.have.length(2);
      expect(conn.calls[1].params.type).to.equal('consent/scope-update-cmc');
      expect(conn.calls[1].params.content).to.deep.equal({ scopeRequestEventId: 'sr-1', accept: true });
      expect(r.updateAcceptEventId).to.equal('up-1');
      expect(r.newDataGrantAccessId).to.equal('abc:2');
    });

    it('[CMCL1UB] refuseScopeUpdate posts scope-update-cmc with accept:false', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'up-2', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      const r = await cmc.refuseScopeUpdate(conn, 'sr-2', { scopeStreamId: ':a' });
      expect(conn.calls[0].params.content.accept).to.equal(false);
      expect(r.updateRefuseEventId).to.equal('up-2');
    });
  });

  describe('[CMCL1N] listAcceptedRelationships', function () {
    it('[CMCL1NA] maps consent/accept-cmc events to RelationshipRecord', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function (params) {
            expect(params.types).to.deep.equal(['consent/accept-cmc']);
            return {
              events: [{
                id: 'acc-1',
                streamIds: [':_cmc:apps:patient:incoming'],
                time: 1234,
                content: {
                  from: { username: 'doctor', host: 'example.com' },
                  dataGrantAccessId: 'dg-1',
                  backChannelAccessId: 'bc-1',
                  features: { chat: true, system: false }
                }
              }]
            };
          }
        }
      });
      const r = await cmc.listAcceptedRelationships(conn);
      expect(r).to.have.length(1);
      expect(r[0].dataGrantAccessId).to.equal('dg-1');
      expect(r[0].counterparty.username).to.equal('doctor');
    });
  });

  describe('[CMCL1Z] observation scopes', function () {
    it('[CMCL1ZA] inbox returns :_cmc:inbox stream scope', function () {
      expect(cmc.scopes.inbox()).to.deep.equal({ streams: [':_cmc:inbox'] });
    });

    it('[CMCL1ZB] chats with appCode only watches the chats parent', function () {
      expect(cmc.scopes.chats({ appCode: 'my-app' })).to.deep.equal({
        streams: [':_cmc:apps:my-app:chats']
      });
    });

    it('[CMCL1ZC] chats with peerSlug narrows to one counterparty stream', function () {
      expect(cmc.scopes.chats({ appCode: 'my-app', peerSlug: 'alice--pryv-me' })).to.deep.equal({
        streams: [':_cmc:apps:my-app:chats:alice--pryv-me']
      });
    });

    it('[CMCL1ZD] collectors symmetrically returns the collectors stream', function () {
      expect(cmc.scopes.collectors({ appCode: 'my-app', peerSlug: 'alice--pryv-me' })).to.deep.equal({
        streams: [':_cmc:apps:my-app:collectors:alice--pryv-me']
      });
    });

    it('[CMCL1ZE] chats/collectors throw without appCode or scopeStreamId', function () {
      expect(() => cmc.scopes.chats({})).to.throw();
      expect(() => cmc.scopes.collectors({})).to.throw();
    });
  });

  // ------------------------------------------------------------
  // J3–J10 wire-shape contract tests.
  //
  // J1 + J2 covered by [CMCL1OA] (readOffer) + [CMCXE] (errorIds catalogue).
  // J3-J10 fill the remaining contract slots so a release-blocking
  // regression in any of these wire shapes surfaces as a unit-test
  // failure rather than a deploy-validation surprise.
  // ------------------------------------------------------------

  describe('[CMCL1OB] J3 listInvites wire-shape', function () {
    it('[CMCL1OB1] calls events.get with `streams` (NOT `streamIds`)', async function () {
      // api-server schema rejects `streamIds` on events.get with
      // OBJECT_ADDITIONAL_PROPERTIES; a regression to streamIds breaks
      // every listInvites caller silently against fresh deploys.
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () { return { events: [] }; }
        }
      });
      await cmc.listInvites(conn, { scopeStreamId: ':_cmc:apps:my-app' });
      const c = conn.calls[0];
      expect(c.method).to.equal('events.get');
      expect(c.params).to.have.property('streams');
      expect(c.params).to.not.have.property('streamIds');
      expect(c.params.streams).to.deep.equal([':_cmc:apps:my-app']);
      expect(c.params.types).to.deep.equal(['consent/request-cmc']);
    });
  });

  describe('[CMCL1OC] J4 listAcceptedRelationships counterparty mapping', function () {
    it('[CMCL1OC1] maps counterparty from content.from when present', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return {
              events: [{
                id: 'evt-1',
                streamIds: [':_cmc:apps:my-app'],
                content: {
                  from: { username: 'alice', host: 'pryv.me' },
                  acceptedBy: { apiEndpoint: 'https://abc@alice.pryv.me/' },
                  dataGrantAccessId: 'dg-1'
                }
              }]
            };
          }
        }
      });
      const r = await cmc.listAcceptedRelationships(conn);
      expect(r).to.have.length(1);
      expect(r[0].counterparty).to.deep.equal({ username: 'alice', host: 'pryv.me' });
      expect(r[0].dataGrantAccessId).to.equal('dg-1');
    });

    it('[CMCL1OC2] falls back to content.acceptedBy when content.from absent', async function () {
      // Pre-PR-72 / pre-Phase-1.1 events on existing deploys don't
      // carry `from` yet. Mapper must still expose something so the
      // SDK doesn't break for migrating users.
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return {
              events: [{
                id: 'evt-2',
                streamIds: [':_cmc:apps:my-app'],
                content: { acceptedBy: { apiEndpoint: 'https://abc@alice.pryv.me/' } }
              }]
            };
          }
        }
      });
      const r = await cmc.listAcceptedRelationships(conn);
      expect(r[0].counterparty).to.deep.equal({ apiEndpoint: 'https://abc@alice.pryv.me/' });
    });

    it('[CMCL1OC3] counterparty is null when both absent', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return { events: [{ id: 'evt-3', streamIds: [':_cmc:apps:my-app'], content: {} }] };
          }
        }
      });
      const r = await cmc.listAcceptedRelationships(conn);
      expect(r[0].counterparty).to.equal(null);
    });
  });

  describe('[CMCL1OD] J5 waitForAccept sinceTime filter', function () {
    it('[CMCL1OD1] skips events with ev.time < sinceTime', async function () {
      // A late call should skip the stale arrival (time=100) and
      // succeed on the fresh one (time=200) without timing out.
      const events = [
        { id: 'old', time: 100, content: { from: { username: 'alice', host: 'pryv.me' } } },
        { id: 'new', time: 200, content: { from: { username: 'alice', host: 'pryv.me' }, grantedAccess: { apiEndpoint: 'https://t@x/' } } }
      ];
      const conn = makeStubConnection({
        handlers: { 'events.get': function () { return { events }; } }
      });
      const r = await cmc.waitForAccept(conn, {
        fromUsername: 'alice', sinceTime: 150, timeoutMs: 1000, intervalMs: 10
      });
      expect(r.acceptInboxEventId).to.equal('new');
      expect(r.grantedAccessApiEndpoint).to.equal('https://t@x/');
    });

    it('[CMCL1OD2] sinceTime DOES NOT filter when ev.time is missing (defensive)', async function () {
      // Pre-stamping events have no `time` — sinceTime should not
      // accidentally drop them (caller would observe a phantom timeout).
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return {
              events: [{ id: 'no-time', content: { from: { username: 'alice', host: 'pryv.me' }, grantedAccess: { apiEndpoint: 'https://t@y/' } } }]
            };
          }
        }
      });
      const r = await cmc.waitForAccept(conn, {
        fromUsername: 'alice', sinceTime: 1000, timeoutMs: 1000, intervalMs: 10
      });
      expect(r.acceptInboxEventId).to.equal('no-time');
    });
  });

  describe('[CMCL1OG] J7 acceptInvite rejects without scopeStreamId', function () {
    it('[CMCL1OG1] throws when scopeStreamId is missing', async function () {
      const conn = makeStubConnection({ handlers: {} });
      let err = null;
      try {
        await cmc.acceptInvite(conn, 'https://t@x/', {});
      } catch (e) { err = e; }
      expect(err).to.not.equal(null);
      expect(String(err.message)).to.match(/scopeStreamId/);
    });

    it('[CMCL1OG2] throws when opts is omitted entirely', async function () {
      const conn = makeStubConnection({ handlers: {} });
      let err = null;
      try {
        await cmc.acceptInvite(conn, 'https://t@x/');
      } catch (e) { err = e; }
      expect(err).to.not.equal(null);
      expect(String(err.message)).to.match(/scopeStreamId/);
    });
  });

  describe('[CMCL1OF] J6 features-negotiation contract', function () {
    // README contract: both `chat` + `systemMessaging` default to true
    // when omitted; explicit false on either is binding both sides.
    //
    // Bug history (2026-05-21, HDS implementer report on
    // open-pryv.io@04bb2c1 + @pryv/cmc@1.1.0):
    //   - SDK acceptInvite never wrote content.features (offerFeatures
    //     computed at line ~674 was unused).
    //   - Plugin handleAccept read triggerEvent.content.extra instead of
    //     content.features (extra is the user-supplied pass-through,
    //     reserved for HDS-specific opts).
    //   - listAcceptedRelationships mapper defaulted to
    //     { chat: false, system: false } (contradicts README) and used
    //     `system` instead of `systemMessaging` (inconsistent with the
    //     contract everywhere else).
    // Together these defaulted the patient-side relationship to all-false
    // even when the offer specified default-true. These contract tests
    // pin each fix so regressions surface at unit-test time.

    function fakePryvWithApiOne (apiOneFn) {
      const stub = {
        apiOne: apiOneFn,
        service: { info: async () => { throw new Error('not stubbed'); } },
        accessInfo: async () => { throw new Error('not stubbed'); }
      };
      return {
        Connection: function () { return stub; },
        utils: { decomposeAPIEndpoint: () => ({ username: null, host: '' }) }
      };
    }

    it('[CMCL1OF1] acceptInvite defaults content.features to {chat:true, systemMessaging:true} when offer omits features', async function () {
      const fakePryv = fakePryvWithApiOne(async function (method, _params, expectedKey) {
        if (method === 'events.get') {
          // Offer event with NO features field — must default to true on both.
          return { events: [{ id: 'offer-1', content: { request: { permissions: [], consent: { en: 'ok' } } } }] }[expectedKey];
        }
        throw new Error('unexpected method: ' + method);
      });
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'acc-default', streamIds: params.streamIds, content: { status: 'pending' } } };
          }
        }
      });
      await cmc.acceptInvite(conn, 'https://Tok@example.com/', {
        scopeStreamId: ':_cmc:apps:test',
        waitForCompletion: false,
        pryv: fakePryv
      });
      const createCall = conn.calls.find(c => c.method === 'events.create');
      expect(createCall, 'expected events.create on accepter conn').to.exist;
      expect(createCall.params.content).to.have.property('features');
      expect(createCall.params.content.features).to.deep.equal({
        chat: true,
        systemMessaging: true
      });
    });

    it('[CMCL1OF2] acceptInvite preserves explicit false on each key from offer', async function () {
      const fakePryv = fakePryvWithApiOne(async function (method, _params, expectedKey) {
        if (method === 'events.get') {
          return { events: [{ id: 'offer-2', content: { request: { permissions: [], consent: { en: 'ok' }, features: { chat: false, systemMessaging: true } } } }] }[expectedKey];
        }
        throw new Error('unexpected method: ' + method);
      });
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'acc-explicit-false', streamIds: params.streamIds, content: { status: 'pending' } } };
          }
        }
      });
      await cmc.acceptInvite(conn, 'https://Tok@example.com/', {
        scopeStreamId: ':_cmc:apps:test',
        waitForCompletion: false,
        pryv: fakePryv
      });
      const createCall = conn.calls.find(c => c.method === 'events.create');
      expect(createCall.params.content.features).to.deep.equal({
        chat: false,
        systemMessaging: true
      });
    });

    it('[CMCL1OF3] listAcceptedRelationships defaults features to {chat:true, systemMessaging:true} when content.features absent', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return {
              events: [{
                id: 'acc-no-feat',
                streamIds: [':_cmc:apps:test'],
                content: {
                  from: { username: 'alice', host: 'pryv.me' },
                  dataGrantAccessId: 'dg-no-feat'
                  // No `features` field — must default to true on both keys.
                }
              }]
            };
          }
        }
      });
      const r = await cmc.listAcceptedRelationships(conn);
      expect(r).to.have.length(1);
      expect(r[0].features).to.deep.equal({ chat: true, systemMessaging: true });
    });

    it('[CMCL1OF4] listAcceptedRelationships passes through content.features verbatim — including explicit false', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.get': function () {
            return {
              events: [{
                id: 'acc-explicit',
                streamIds: [':_cmc:apps:test'],
                content: {
                  from: { username: 'alice', host: 'pryv.me' },
                  dataGrantAccessId: 'dg-explicit',
                  features: { chat: true, systemMessaging: false }
                }
              }]
            };
          }
        }
      });
      const r = await cmc.listAcceptedRelationships(conn);
      expect(r[0].features).to.deep.equal({ chat: true, systemMessaging: false });
    });
  });

  describe('[CMCAH] accept hand-off helpers (requestAcceptUrl + requestAccept)', function () {
    const BASE = 'https://access.pryv.me/access/v3/cmc-accept';
    const PRYV_API = 'https://reg.pryv.me/';
    const CAP_URL = 'https://AbCdEf@example.com/';
    const SCOPE = ':_cmc:apps:my-app';

    it('[CMCAH1] requestAcceptUrl builds popup-mode URL with required + optional params', function () {
      const url = cmc.requestAcceptUrl({
        authUrl: BASE,
        pryvApi: PRYV_API,
        capabilityUrl: CAP_URL,
        scopeStreamId: SCOPE,
        accessName: 'my-grant'
      });
      const u = new URL(url);
      expect(u.searchParams.get('capabilityUrl')).to.equal(CAP_URL);
      expect(u.searchParams.get('scopeStreamId')).to.equal(SCOPE);
      expect(u.searchParams.get('pryvApi')).to.equal(PRYV_API);
      expect(u.searchParams.get('accessName')).to.equal('my-grant');
      expect(u.searchParams.get('mode')).to.equal('popup');
      expect(u.searchParams.get('returnUrl')).to.equal(null);
    });

    it('[CMCAH2] requestAcceptUrl switches to redirect mode when returnUrl is provided', function () {
      const url = cmc.requestAcceptUrl({
        authUrl: BASE,
        pryvApi: PRYV_API,
        capabilityUrl: CAP_URL,
        scopeStreamId: SCOPE,
        returnUrl: 'https://app.example.com/accepted'
      });
      const u = new URL(url);
      expect(u.searchParams.get('mode')).to.equal('redirect');
      expect(u.searchParams.get('returnUrl')).to.equal('https://app.example.com/accepted');
    });

    it('[CMCAH3] requestAcceptUrl preserves a pre-existing query string on authUrl', function () {
      const url = cmc.requestAcceptUrl({
        authUrl: BASE + '?lang=en',
        pryvApi: PRYV_API,
        capabilityUrl: CAP_URL,
        scopeStreamId: SCOPE
      });
      expect(url.startsWith(BASE + '?lang=en&')).to.equal(true);
      const u = new URL(url);
      expect(u.searchParams.get('lang')).to.equal('en');
      expect(u.searchParams.get('capabilityUrl')).to.equal(CAP_URL);
    });

    it('[CMCAH4] requestAcceptUrl throws when required options are missing', function () {
      expect(() => cmc.requestAcceptUrl({ pryvApi: PRYV_API, capabilityUrl: CAP_URL, scopeStreamId: SCOPE })).to.throw(/authUrl/);
      expect(() => cmc.requestAcceptUrl({ authUrl: BASE, pryvApi: PRYV_API, scopeStreamId: SCOPE })).to.throw(/capabilityUrl/);
      expect(() => cmc.requestAcceptUrl({ authUrl: BASE, pryvApi: PRYV_API, capabilityUrl: CAP_URL })).to.throw(/scopeStreamId/);
      expect(() => cmc.requestAcceptUrl({ authUrl: BASE, capabilityUrl: CAP_URL, scopeStreamId: SCOPE })).to.throw(/pryvApi/);
    });

    it('[CMCAH5] requestAccept resolves with the postMessage payload', async function () {
      // Stub a minimal browser environment.
      const listeners = [];
      const fakePopup = { closed: false, close: function () { this.closed = true; } };
      const fakeWindow = {
        open: function () { return fakePopup; },
        addEventListener: function (type, handler) { if (type === 'message') listeners.push(handler); },
        removeEventListener: function (type, handler) {
          if (type !== 'message') return;
          const i = listeners.indexOf(handler);
          if (i >= 0) listeners.splice(i, 1);
        },
        location: { assign: function () { throw new Error('redirect path not expected in this test'); } }
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        const p = cmc.requestAccept({
          authUrl: BASE,
          pryvApi: PRYV_API,
          capabilityUrl: CAP_URL,
          scopeStreamId: SCOPE,
          timeoutMs: 1000
        });
        // Simulate the page posting the result.
        setTimeout(function () {
          for (const h of listeners.slice()) {
            h({ data: { type: 'cmc-accept-result', ok: true, dataGrantApiEndpoint: 'https://t@x/', acceptEventId: 'ev-1' } });
          }
        }, 5);
        const result = await p;
        expect(result.ok).to.equal(true);
        expect(result.dataGrantApiEndpoint).to.equal('https://t@x/');
        expect(result.acceptEventId).to.equal('ev-1');
      } finally {
        global.window = prevWindow;
      }
    });

    it('[CMCAH6] requestAccept rejects with CmcError on popup-closed', async function () {
      const fakePopup = { closed: false, close: function () { this.closed = true; } };
      const fakeWindow = {
        open: function () { return fakePopup; },
        addEventListener: function () {},
        removeEventListener: function () {},
        location: { assign: function () {} }
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        const p = cmc.requestAccept({
          authUrl: BASE,
          pryvApi: PRYV_API,
          capabilityUrl: CAP_URL,
          scopeStreamId: SCOPE,
          timeoutMs: 2000
        });
        setTimeout(function () { fakePopup.closed = true; }, 50);
        let caught;
        try { await p; } catch (e) { caught = e; }
        expect(caught).to.be.an('error');
        expect(caught.id).to.equal('cmc-accept-popup-closed');
      } finally {
        global.window = prevWindow;
      }
    });

    it('[CMCAH7] requestAccept rejects with cmc-accept-popup-blocked when window.open returns null', async function () {
      const fakeWindow = {
        open: function () { return null; },
        addEventListener: function () {},
        removeEventListener: function () {},
        location: { assign: function () {} }
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        let caught;
        try {
          await cmc.requestAccept({
            authUrl: BASE,
            pryvApi: PRYV_API,
            capabilityUrl: CAP_URL,
            scopeStreamId: SCOPE
          });
        } catch (e) { caught = e; }
        expect(caught).to.be.an('error');
        expect(caught.id).to.equal('cmc-accept-popup-blocked');
      } finally {
        global.window = prevWindow;
      }
    });

    it('[CMCAH8] requestAccept in redirect mode calls window.location.assign and resolves immediately', async function () {
      const assigned = [];
      const fakeWindow = {
        open: function () { return { closed: false, close: function () {} }; },
        addEventListener: function () {},
        removeEventListener: function () {},
        location: { assign: function (url) { assigned.push(url); } }
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        const result = await cmc.requestAccept({
          authUrl: BASE,
          pryvApi: PRYV_API,
          capabilityUrl: CAP_URL,
          scopeStreamId: SCOPE,
          returnUrl: 'https://app.example.com/callback'
        });
        expect(assigned).to.have.length(1);
        expect(assigned[0]).to.include('mode=redirect');
        expect(assigned[0]).to.include('returnUrl=' + encodeURIComponent('https://app.example.com/callback'));
        expect(result.ok).to.equal(true);
        expect(result.redirected).to.equal(true);
      } finally {
        global.window = prevWindow;
      }
    });
  });

  describe('[CMCSUH] scope-update hand-off helpers (requestScopeUpdateUrl + requestScopeUpdate)', function () {
    const BASE = 'https://access.pryv.me/access/v3/cmc-scope-update';
    const PRYV_API = 'https://reg.pryv.me/';
    const SCOPE_REQ = 'evt-scope-req-abc123';

    it('[CMCSUH1] requestScopeUpdateUrl builds popup-mode URL', function () {
      const url = cmc.requestScopeUpdateUrl({
        authUrl: BASE,
        pryvApi: PRYV_API,
        scopeRequestEventId: SCOPE_REQ,
        scopeStreamId: ':_cmc:apps:my-app:collectors:bob--pryv-me',
      });
      const u = new URL(url);
      expect(u.searchParams.get('scopeRequestEventId')).to.equal(SCOPE_REQ);
      expect(u.searchParams.get('scopeStreamId')).to.equal(':_cmc:apps:my-app:collectors:bob--pryv-me');
      expect(u.searchParams.get('pryvApi')).to.equal(PRYV_API);
      expect(u.searchParams.get('mode')).to.equal('popup');
      expect(u.searchParams.get('returnUrl')).to.equal(null);
    });

    it('[CMCSUH2] requestScopeUpdateUrl switches to redirect when returnUrl is given', function () {
      const url = cmc.requestScopeUpdateUrl({
        authUrl: BASE,
        pryvApi: PRYV_API,
        scopeRequestEventId: SCOPE_REQ,
        returnUrl: 'https://app.example.com/done',
      });
      const u = new URL(url);
      expect(u.searchParams.get('mode')).to.equal('redirect');
      expect(u.searchParams.get('returnUrl')).to.equal('https://app.example.com/done');
    });

    it('[CMCSUH3] requestScopeUpdateUrl throws when required options are missing', function () {
      expect(() => cmc.requestScopeUpdateUrl({ pryvApi: PRYV_API, scopeRequestEventId: SCOPE_REQ })).to.throw(/authUrl/);
      expect(() => cmc.requestScopeUpdateUrl({ authUrl: BASE, pryvApi: PRYV_API })).to.throw(/scopeRequestEventId/);
      expect(() => cmc.requestScopeUpdateUrl({ authUrl: BASE, scopeRequestEventId: SCOPE_REQ })).to.throw(/pryvApi/);
    });

    it('[CMCSUH4] requestScopeUpdate resolves with the postMessage payload', async function () {
      const listeners = [];
      const fakePopup = { closed: false, close: function () { this.closed = true; } };
      const fakeWindow = {
        open: function () { return fakePopup; },
        addEventListener: function (type, handler) { if (type === 'message') listeners.push(handler); },
        removeEventListener: function (type, handler) {
          if (type !== 'message') return;
          const i = listeners.indexOf(handler);
          if (i >= 0) listeners.splice(i, 1);
        },
        location: { assign: function () { throw new Error('redirect path not expected in this test'); } },
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        const p = cmc.requestScopeUpdate({
          authUrl: BASE,
          pryvApi: PRYV_API,
          scopeRequestEventId: SCOPE_REQ,
          timeoutMs: 1000,
        });
        setTimeout(function () {
          for (const h of listeners.slice()) {
            h({ data: { type: 'cmc-scope-update-result', ok: true, updateEventId: 'su-ev-1', action: 'accept' } });
          }
        }, 5);
        const result = await p;
        expect(result.ok).to.equal(true);
        expect(result.updateEventId).to.equal('su-ev-1');
        expect(result.action).to.equal('accept');
      } finally {
        global.window = prevWindow;
      }
    });

    it('[CMCSUH5] requestScopeUpdate rejects on popup-blocked', async function () {
      const fakeWindow = {
        open: function () { return null; },
        addEventListener: function () {},
        removeEventListener: function () {},
        location: { assign: function () {} },
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        let caught;
        try {
          await cmc.requestScopeUpdate({
            authUrl: BASE,
            pryvApi: PRYV_API,
            scopeRequestEventId: SCOPE_REQ,
          });
        } catch (e) { caught = e; }
        expect(caught).to.be.an('error');
        expect(caught.id).to.equal('cmc-scope-update-popup-blocked');
      } finally {
        global.window = prevWindow;
      }
    });

    it('[CMCSUH6] requestScopeUpdate redirect mode calls location.assign', async function () {
      const assigned = [];
      const fakeWindow = {
        open: function () { return { closed: false, close: function () {} }; },
        addEventListener: function () {},
        removeEventListener: function () {},
        location: { assign: function (url) { assigned.push(url); } },
      };
      const prevWindow = global.window;
      global.window = fakeWindow;
      try {
        const result = await cmc.requestScopeUpdate({
          authUrl: BASE,
          pryvApi: PRYV_API,
          scopeRequestEventId: SCOPE_REQ,
          returnUrl: 'https://app.example.com/done',
        });
        expect(assigned).to.have.length(1);
        expect(assigned[0]).to.include('mode=redirect');
        expect(result.ok).to.equal(true);
        expect(result.redirected).to.equal(true);
      } finally {
        global.window = prevWindow;
      }
    });
  });

  describe('[CMCL1OH] J8 acceptInvite resolves dataGrantAccessId on waitForCompletion', function () {
    it('[CMCL1OH1] returns dataGrantAccessId from the post-completion getOne', async function () {
      // Two-phase: events.create returns status pending; pollTriggerCompletion
      // calls events.getOne and reads the final dataGrantAccessId.
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 'accept-1', streamIds: params.streamIds, content: { status: 'pending' } } };
          },
          'events.getOne': function () {
            return {
              event: {
                id: 'accept-1',
                content: { status: 'completed', dataGrantAccessId: 'dg-xyz' }
              }
            };
          }
        }
      });
      const r = await cmc.acceptInvite(conn, 'https://t@x/', {
        scopeStreamId: ':_cmc:apps:test',
        completionPollIntervalMs: 5,
        completionTimeoutMs: 1000
      });
      expect(r.acceptEventId).to.equal('accept-1');
      expect(r.dataGrantAccessId).to.equal('dg-xyz');
    });
  });
});
