/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const cmc = require('../src/cmc');

describe('[CMCX] pryv.cmc client helpers', function () {
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

  describe('[CMCXI] integration with pryv module', function () {
    it('[CMCXIA] exposed as pryv.cmc', function () {
      const pryv = require('../src');
      expect(pryv.cmc).to.exist;
      expect(pryv.cmc.counterpartySlug).to.be.a('function');
      expect(pryv.cmc.NS).to.equal(':_cmc:');
    });
  });

  describe('[CMCXA] extractActor', function () {
    it('[CMCXAA] subdomain template — host strips the {username}. prefix', function () {
      const r = cmc.extractActor(
        'https://t0k3n@alice.pryv.me/',
        'https://{username}.pryv.me/'
      );
      expect(r).to.deep.equal({ token: 't0k3n', username: 'alice', host: 'pryv.me' });
    });

    it('[CMCXAB] path-style template — host is the literal hostname[:port]', function () {
      const r = cmc.extractActor(
        'http://t0k3n@127.0.0.1:3000/alice/',
        'http://127.0.0.1:3000/{username}/'
      );
      expect(r).to.deep.equal({ token: 't0k3n', username: 'alice', host: '127.0.0.1:3000' });
    });

    it('[CMCXAC] returns username:null when the endpoint doesn\'t match the template', function () {
      const r = cmc.extractActor(
        'https://t0k3n@somewhere.else.com/',
        'https://{username}.pryv.me/'
      );
      expect(r.username).to.equal(null);
    });

    it('[CMCXAD] returns token:null when endpoint carries no token', function () {
      const r = cmc.extractActor(
        'https://alice.pryv.me/',
        'https://{username}.pryv.me/'
      );
      expect(r.token).to.equal(null);
      expect(r.username).to.equal('alice');
      expect(r.host).to.equal('pryv.me');
    });
  });
});
