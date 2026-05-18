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

  describe('[CMCL1S] requestScopeUpdate', function () {
    it('[CMCL1SA] posts consent/scope-request-cmc with newPermissions', async function () {
      const conn = makeStubConnection({
        handlers: {
          'events.create': function (params) {
            return { event: { id: 's-1', streamIds: params.streamIds, content: params.content } };
          }
        }
      });
      const r = await cmc.requestScopeUpdate(conn, {
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
});
