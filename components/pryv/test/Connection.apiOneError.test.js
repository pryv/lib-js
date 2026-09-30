/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect, pryv */

/**
 * [CAEX] `apiOne()` errors never carry the call's params in their message.
 *
 * Params can hold passwords and tokens, and error messages end up in logs and
 * on screen. The message names the method and the server's error; the full
 * error (or result) stays on `innerObject`. `api()` is stubbed: no server.
 */

const SECRET = 'pa55-S3CRET-value';

function connWithResult (result) {
  const conn = new pryv.Connection('https://sometoken@alice.example.test/');
  conn.api = async () => result;
  return conn;
}

async function caught (promise) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('expected a rejection');
}

describe('[CAEX] apiOne() error message', function () {
  it('[CAEA] an error answer: method and server error in the message, params left out', async () => {
    const serverError = { id: 'invalid-credentials', message: 'The given username/password pair is invalid.' };
    const conn = connWithResult([{ error: serverError }]);
    const e = await caught(conn.apiOne('auth.login', { username: 'alice', password: SECRET }));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('"auth.login"');
    expect(e.message).to.include('invalid-credentials');
    expect(e.message).to.include('The given username/password pair is invalid.');
    expect(e.message).to.not.include(SECRET);
    expect(e.message).to.not.include('alice');
    expect(e.innerObject).to.equal(serverError);
  });

  it('[CAEB] expected key missing: named in the message, result data left out', async () => {
    const result = [{ access: { token: SECRET } }];
    const conn = connWithResult(result);
    const e = await caught(conn.apiOne('accesses.create', { name: 'x', token: SECRET }, 'accessX'));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('"accesses.create"');
    expect(e.message).to.include('"accessX" missing in result');
    expect(e.message).to.not.include(SECRET);
    expect(e.innerObject).to.equal(result);
  });

  it('[CAEC] no result at all', async () => {
    const conn = connWithResult([]);
    const e = await caught(conn.apiOne('events.get', { token: SECRET }));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('"events.get"');
    expect(e.message).to.include('no result');
    expect(e.message).to.not.include(SECRET);
  });

  it('[CAED] an error answer without id or message', async () => {
    const serverError = {};
    const conn = connWithResult([{ error: serverError }]);
    const e = await caught(conn.apiOne('events.get', { token: SECRET }));
    expect(e.message).to.include('"events.get"');
    expect(e.message).to.include('error answer');
    expect(e.message).to.not.include('undefined');
    expect(e.innerObject).to.equal(serverError);
  });
});

/**
 * [CAEY] A batch answer that breaks the protocol: the answer rides on
 * `innerObject`, never in the message (results can hold tokens).
 */
describe('[CAEY] api() protocol-violation errors', function () {
  function connWithAnswer (answer) {
    const conn = new pryv.Connection('https://sometoken@alice.example.test/');
    conn.post = async () => answer;
    return conn;
  }

  it('[CAEE] an answer without results', async () => {
    const answer = { error: { id: 'x', message: 'y', data: { token: SECRET } } };
    const e = await caught(connWithAnswer(answer).api([{ method: 'events.get', params: {} }]));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('not an Array');
    expect(e.message).to.not.include(SECRET);
    expect(e.innerObject).to.equal(answer);
  });

  it('[CAEF] results that do not match the calls', async () => {
    const answer = { results: [{ access: { token: SECRET } }, {}] };
    const e = await caught(connWithAnswer(answer).api([{ method: 'accesses.create', params: {} }]));
    expect(e).to.be.instanceOf(pryv.PryvError);
    expect(e.message).to.include('does not match');
    expect(e.message).to.not.include(SECRET);
    expect(e.innerObject).to.equal(answer);
  });
});
