/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect, pryv */

const AuthController = require('../src/Auth/AuthController');

/**
 * [CAFX] `accessInfo()` rejects an error answer and caches successes only.
 *
 * The HTTP layer is stubbed (`_getFetchRaw`, below `get()`): no server. Each
 * answer carries `meta` like a real Pryv.io answer, errors included.
 */

const INVALID_TOKEN = { id: 'invalid-access-token', message: 'Cannot find access from token.' };

function meta () {
  return { serverTime: Date.now() / 1000 };
}

/**
 * A connection whose `access-info` answers come from `answers` in order (the
 * last one repeats); `conn.fetches` counts the requests.
 */
function connAnswering (...answers) {
  const conn = new pryv.Connection('https://sometoken@alice.example.test/');
  conn.fetches = 0;
  conn._getFetchRaw = async (path) => {
    expect(path).to.equal('access-info');
    const answer = answers[Math.min(conn.fetches, answers.length - 1)];
    conn.fetches++;
    if (answer instanceof Error) throw answer;
    return { response: {}, body: Object.assign({ meta: meta() }, answer) };
  };
  return conn;
}

function accessAnswer (name) {
  return { id: 'acc-' + name, name, token: 'sometoken', user: { username: 'alice' } };
}

async function caught (promise) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('expected a rejection');
}

describe('[CAFX] accessInfo() on an error answer', function () {
  it('[CAFA] rejects with a PryvError carrying the server error, as apiOne() does', async () => {
    const conn = connAnswering({ error: INVALID_TOKEN });
    const e = await caught(conn.accessInfo());
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('invalid-access-token');
    expect(e.message).to.include('Cannot find access from token.');
    expect(e.message).to.not.include('sometoken');
    expect(e.innerObject).to.deep.equal(INVALID_TOKEN);
  });

  it('[CAFB] a failure is not cached: the next call asks the server again', async () => {
    const conn = connAnswering({ error: INVALID_TOKEN }, { error: INVALID_TOKEN }, accessAnswer('later'));
    await caught(conn.accessInfo());
    await caught(conn.accessInfo());
    expect(conn.fetches).to.equal(2);
    const info = await conn.accessInfo();
    expect(conn.fetches).to.equal(3);
    expect(info.name).to.equal('later');
  });

  it('[CAFC] a success is cached', async () => {
    const conn = connAnswering(accessAnswer('one'));
    const first = await conn.accessInfo();
    const second = await conn.accessInfo();
    expect(second).to.equal(first);
    expect(conn.fetches).to.equal(1);
  });

  it('[CAFD] a failed refresh rejects and leaves the cached success in place', async () => {
    const conn = connAnswering(accessAnswer('one'), { error: INVALID_TOKEN });
    const first = await conn.accessInfo();
    const e = await caught(conn.accessInfo(true));
    expect(e.innerObject.id).to.equal('invalid-access-token');
    expect(await conn.accessInfo()).to.equal(first);
    expect(conn.fetches).to.equal(2);
  });

  it('[CAFE] an error answer without id or message', async () => {
    const conn = connAnswering({ error: {} });
    const e = await caught(conn.accessInfo());
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('error answer');
    expect(e.message).to.not.include('undefined');
  });

  it('[CAFF] username() rejects with the same error', async () => {
    const conn = connAnswering({ error: INVALID_TOKEN });
    const e = await caught(conn.username());
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.innerObject.id).to.equal('invalid-access-token');
    expect(e.message).to.include('Cannot find access from token.');
  });

  it('[CAFG] username() resolves from a successful answer', async () => {
    const conn = connAnswering(accessAnswer('one'));
    expect(await conn.username()).to.equal('alice');
  });
});

describe('[CAFR] revoke() with the rejecting accessInfo()', function () {
  it('[CAFH] an already invalid token: resolves null without trying to delete', async () => {
    const conn = connAnswering({ error: INVALID_TOKEN });
    conn.apiOne = async () => { throw new Error('no delete expected'); };
    expect(await conn.revoke()).to.equal(null);
  });

  it('[CAFI] another error answer: rejects, or resolves null when throwOnFail is false', async () => {
    const forbidden = { id: 'forbidden', message: 'nope' };
    const e = await caught(connAnswering({ error: forbidden }).revoke());
    expect(e.innerObject.id).to.equal('forbidden');
    expect(await connAnswering({ error: forbidden }).revoke(false)).to.equal(null);
  });

  it('[CAFJ] a failed delete: rejects, or resolves null when throwOnFail is false', async () => {
    const failing = () => {
      const conn = connAnswering(accessAnswer('one'));
      conn.apiOne = async (method, params) => {
        expect(method).to.equal('accesses.delete');
        expect(params.id).to.equal('acc-one');
        throw new Error('delete failed');
      };
      return conn;
    };
    const e = await caught(failing().revoke());
    expect(e.message).to.equal('delete failed');
    expect(await failing().revoke(false)).to.equal(null);
  });
});

describe('[CAFK] AuthController access check with the rejecting accessInfo()', function () {
  const accessInfo = (url) => AuthController.prototype._accessInfo.call({}, url);

  function stubGetFetchRaw (impl) {
    const original = pryv.Connection.prototype._getFetchRaw;
    pryv.Connection.prototype._getFetchRaw = impl;
    return () => { pryv.Connection.prototype._getFetchRaw = original; };
  }

  it('[CAFL] an error answer is returned as { error } for the account switch to decide', async () => {
    const restore = stubGetFetchRaw(async () => ({ response: {}, body: { error: INVALID_TOKEN, meta: meta() } }));
    try {
      const info = await accessInfo('https://tok@kim.example.test/');
      expect(info).to.deep.equal({ error: INVALID_TOKEN });
    } finally {
      restore();
    }
  });

  it('[CAFM] a network failure is still thrown', async () => {
    const restore = stubGetFetchRaw(async () => { throw new Error('offline'); });
    try {
      const e = await caught(accessInfo('https://tok@kim.example.test/'));
      expect(e.message).to.equal('offline');
    } finally {
      restore();
    }
  });
});
