/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, afterEach, expect, pryv */

/**
 * [ARQC] The `consent` sidecar of an auth request travels untouched.
 *
 * The sidecar is how an app says which permissions are required, which are
 * offered pre-selected, and which the user must opt into. This library must
 * neither invent it nor filter it: it posts what the caller gave it and
 * hands back what the core answered. These pin that, so a future "helpful"
 * field whitelist in `startAccessRequest` cannot silently drop consent
 * semantics on their way to the server.
 *
 * Driven through a stubbed global fetch rather than a live core: what is
 * being tested is this library's pass-through, and a core that predates
 * the sidecar is one of the cases.
 */

const SERVICE_INFO = {
  register: 'https://reg.test.local/',
  access: 'https://reg.test.local/access',
  api: 'https://{username}.test.local/',
  name: 'Test'
};

const CONSENT = {
  allowUserChoice: true,
  mandatory: ['diary'],
  optIn: ['weight']
};

const REQUEST = {
  requestingAppId: 'jslib-test',
  requestedPermissions: [
    { streamId: 'diary', level: 'read', defaultName: 'Journal' },
    { streamId: 'weight', level: 'read', defaultName: 'Weight' }
  ],
  consent: CONSENT
};

describe('[ARQC] auth-request consent sidecar', function () {
  let realFetch;
  let posted;

  /** Stub fetch: serve service-info, capture the access POST, answer it. */
  function stubFetch (accessResponse) {
    realFetch = global.fetch;
    posted = [];
    global.fetch = async function (url, options) {
      if (String(url).includes('/access')) {
        posted.push(JSON.parse(options.body));
        return {
          ok: true,
          status: 201,
          json: async () => accessResponse
        };
      }
      return { ok: true, status: 200, json: async () => SERVICE_INFO };
    };
  }

  afterEach(function () {
    if (realFetch) global.fetch = realFetch;
    realFetch = null;
  });

  it('[SARC1] posts the consent sidecar verbatim', async function () {
    stubFetch({ key: 'k1', authUrl: 'https://auth/', poll: 'https://poll/k1', poll_rate_ms: 1000 });
    const service = new pryv.Service('https://reg.test.local/service/info');
    await service.startAccessRequest(REQUEST);
    expect(posted).to.have.lengthOf(1);
    expect(posted[0].consent).to.deep.equal(CONSENT);
    // And the permissions stay plain: the annotations live in the sidecar,
    // never inside an entry (the API rejects unknown per-entry fields).
    expect(posted[0].requestedPermissions).to.deep.equal(REQUEST.requestedPermissions);
  });

  it('[SARC2] returns the consent form a core echoes back, and nothing when it does not', async function () {
    const form = {
      allowUserChoice: true,
      permissions: [
        { streamId: 'diary', level: 'read', defaultName: 'Journal', mandatory: true },
        { streamId: 'weight', level: 'read', defaultName: 'Weight', optIn: true }
      ]
    };
    stubFetch({
      key: 'k1',
      authUrl: 'https://auth/',
      poll: 'https://poll/k1',
      poll_rate_ms: 1000,
      consent: form
    });
    const service = new pryv.Service('https://reg.test.local/service/info');
    const env = await service.startAccessRequest(REQUEST);
    // The echo is how an app knows the core understood the annotations.
    expect(env.consent).to.deep.equal(form);
    if (realFetch) { global.fetch = realFetch; realFetch = null; }

    // A core that predates the sidecar answers without it. The request
    // still succeeds and the consent screen falls back to all-or-nothing,
    // so the absence is the signal, not an error.
    stubFetch({ key: 'k2', authUrl: 'https://auth/', poll: 'https://poll/k2', poll_rate_ms: 1000 });
    const older = new pryv.Service('https://reg.test.local/service/info');
    const envOld = await older.startAccessRequest(REQUEST);
    expect(envOld.key).to.equal('k2');
    expect(envOld).to.not.have.property('consent');
  });
});
