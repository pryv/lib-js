/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

describe('[UTLX] utils', function () {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
  });

  it('[UTLA] extractTokenAndAPIEndpoint', function (done) {
    const tokenAndAPI = pryv.utils
      .extractTokenAndAPIEndpoint(testData.apiEndpointWithToken);
    expect(testData.token).to.equal(tokenAndAPI.token);

    expect(testData.apiEndpoint).to.equal(tokenAndAPI.endpoint);
    done();
  });

  it('[UTLB] extractTokenAndAPIEndpoint should work without token', function (done) {
    const tokenAndAPI = pryv.utils
      .extractTokenAndAPIEndpoint(testData.apiEndpoint);

    expect(tokenAndAPI.token).to.not.exist;

    expect(testData.apiEndpoint).to.equal(tokenAndAPI.endpoint);
    done();
  });

  it('[UTLC] extractTokenAndAPIEndpoint should fail on invalid url', function (done) {
    let error = null;
    try {
      pryv.utils.extractTokenAndAPIEndpoint('blip');
    } catch (e) {
      error = e;
      return done();
    }
    expect(error).to.exist;
  });

  it('[UTLD] buildAPIEndpoint with token', function (done) {
    const apiEndpoint = pryv.utils
      .buildAPIEndpoint({
        token: testData.token,
        endpoint: testData.apiEndpoint
      });
    expect(apiEndpoint).to.equal(testData.apiEndpointWithToken);
    done();
  });

  it('[UTLE] buildAPIEndpoint without token', function (done) {
    const apiEndpoint = pryv.utils
      .buildAPIEndpoint({
        token: null,
        endpoint: testData.apiEndpoint
      });
    expect(apiEndpoint).to.equal(testData.apiEndpoint);
    done();
  });

  // Composite access references.

  it('[UTLF] parseAccessRef on a bare cuid returns { base, serial: null }', function () {
    const ref = pryv.utils.parseAccessRef('abc123def456');
    expect(ref).to.eql({ base: 'abc123def456', serial: null });
  });

  it('[UTLG] parseAccessRef on a composite returns { base, serial }', function () {
    const ref = pryv.utils.parseAccessRef('abc123:7');
    expect(ref).to.eql({ base: 'abc123', serial: 7 });
  });

  it('[UTLH] parseAccessRef on garbage throws', function () {
    expect(() => pryv.utils.parseAccessRef('')).to.throw();
    expect(() => pryv.utils.parseAccessRef(':1')).to.throw();
    expect(() => pryv.utils.parseAccessRef('abc:notanumber')).to.throw();
    expect(() => pryv.utils.parseAccessRef('abc:0')).to.throw();
    expect(() => pryv.utils.parseAccessRef('abc:-1')).to.throw();
    expect(() => pryv.utils.parseAccessRef(null)).to.throw();
  });

  it('[UTLI] serializeAccessRef round-trips parseAccessRef', function () {
    const samples = ['plainCuid', 'plainCuid:1', 'plainCuid:42'];
    for (const s of samples) {
      expect(pryv.utils.serializeAccessRef(pryv.utils.parseAccessRef(s))).to.equal(s);
    }
  });

  it('[UTLJ] serializeAccessRef rejects bad inputs', function () {
    expect(() => pryv.utils.serializeAccessRef(null)).to.throw();
    expect(() => pryv.utils.serializeAccessRef({ base: '' })).to.throw();
    expect(() => pryv.utils.serializeAccessRef({ base: 'abc', serial: 0 })).to.throw();
    expect(() => pryv.utils.serializeAccessRef({ base: 'abc', serial: 1.5 })).to.throw();
  });

  it('[UTLK] StaleAccessIdError extends PryvError', function () {
    const err = new pryv.StaleAccessIdError('stale!', { provided: 'abc:1', currentSerial: 2 });
    expect(err).to.be.instanceOf(pryv.StaleAccessIdError);
    expect(err).to.be.instanceOf(pryv.PryvError);
    expect(err.data.provided).to.equal('abc:1');
    expect(err.data.currentSerial).to.equal(2);
    expect(err.name).to.equal('StaleAccessIdError');
  });

  describe('[UTLM] decomposeAPIEndpoint', function () {
    it('[UTLMA] subdomain template — host strips the {username}. prefix', function () {
      const r = pryv.utils.decomposeAPIEndpoint(
        'https://t0k3n@alice.pryv.me/',
        'https://{username}.pryv.me/'
      );
      expect(r).to.eql({ token: 't0k3n', username: 'alice', host: 'pryv.me' });
    });

    it('[UTLMB] path-style template — host is the literal hostname[:port]', function () {
      const r = pryv.utils.decomposeAPIEndpoint(
        'http://t0k3n@127.0.0.1:3000/alice/',
        'http://127.0.0.1:3000/{username}/'
      );
      expect(r).to.eql({ token: 't0k3n', username: 'alice', host: '127.0.0.1:3000' });
    });

    it('[UTLMC] returns username:null when the endpoint doesn\'t match the template', function () {
      const r = pryv.utils.decomposeAPIEndpoint(
        'https://t0k3n@somewhere.else.com/',
        'https://{username}.pryv.me/'
      );
      expect(r.username).to.equal(null);
      expect(r.token).to.equal('t0k3n');
    });

    it('[UTLMD] returns token:null when endpoint carries no token', function () {
      const r = pryv.utils.decomposeAPIEndpoint(
        'https://alice.pryv.me/',
        'https://{username}.pryv.me/'
      );
      expect(r.token).to.equal(null);
      expect(r.username).to.equal('alice');
      expect(r.host).to.equal('pryv.me');
    });
  });
});
