/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect, pryv */

/**
 * [CBCX] `api()` splits calls into chunks of `chunkSize` and posts one batch
 * per chunk, never a trailing empty one. `post()` is stubbed: no server.
 */

function stubbedConnection (chunkSize) {
  const conn = new pryv.Connection('https://sometoken@alice.example.test/');
  conn.options.chunkSize = chunkSize;
  const posted = [];
  conn.post = async (path, batch) => {
    posted.push(batch.length);
    return { results: batch.map(() => ({ ok: true })) };
  };
  return { conn, posted };
}

function calls (n) {
  return Array.from({ length: n }, () => ({ method: 'events.get', params: {} }));
}

describe('[CBCX] api() chunking', function () {
  it('[CBCA] an exact multiple of chunkSize posts no trailing empty batch', async () => {
    const { conn, posted } = stubbedConnection(2);
    const progress = [];
    const res = await conn.api(calls(4), (p) => progress.push(p));
    expect(res.length).to.equal(4);
    expect(posted).to.deep.equal([2, 2]);
    expect(progress).to.deep.equal([50, 100]);
  });

  it('[CBCB] an empty list posts nothing and resolves with an empty array', async () => {
    const { conn, posted } = stubbedConnection(2);
    const progress = [];
    const res = await conn.api([], (p) => progress.push(p));
    expect(res).to.deep.equal([]);
    expect(posted).to.deep.equal([]);
    expect(progress).to.deep.equal([]);
  });

  it('[CBCD] a chunkSize that cannot advance is refused instead of looping forever', async () => {
    for (const bad of [0, -1, 1.5, undefined]) {
      const { conn, posted } = stubbedConnection(bad);
      let error = null;
      try {
        await conn.api(calls(1));
      } catch (e) {
        error = e;
      }
      expect(error, 'chunkSize ' + bad).to.be.instanceOf(Error);
      expect(error.message).to.include('chunkSize');
      expect(posted).to.deep.equal([]);
    }
  });

  it('[CBCC] a partial last chunk is posted', async () => {
    const { conn, posted } = stubbedConnection(2);
    const res = await conn.api(calls(3));
    expect(res.length).to.equal(3);
    expect(posted).to.deep.equal([2, 1]);
  });
});
