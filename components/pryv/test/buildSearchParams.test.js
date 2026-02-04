/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const buildSearchParams = require('../src/lib/buildSearchParams');

describe('[BSPX] buildSearchParams', function () {
  it('[BSPA] builds params from simple object', function () {
    const result = buildSearchParams({ foo: 'bar', num: 123 });
    expect(result).to.equal('foo=bar&num=123');
  });

  it('[BSPB] handles arrays as repeated keys', function () {
    const result = buildSearchParams({ tags: ['a', 'b', 'c'] });
    expect(result).to.equal('tags=a&tags=b&tags=c');
  });

  it('[BSPC] handles mixed arrays and values', function () {
    const result = buildSearchParams({
      name: 'test',
      ids: ['id1', 'id2'],
      limit: 10
    });
    expect(result).to.include('name=test');
    expect(result).to.include('ids=id1');
    expect(result).to.include('ids=id2');
    expect(result).to.include('limit=10');
  });

  it('[BSPD] ignores null and undefined values', function () {
    const result = buildSearchParams({
      valid: 'yes',
      nullVal: null,
      undefVal: undefined
    });
    expect(result).to.equal('valid=yes');
  });

  it('[BSPE] handles empty object', function () {
    const result = buildSearchParams({});
    expect(result).to.equal('');
  });

  it('[BSPF] encodes special characters', function () {
    const result = buildSearchParams({ query: 'hello world', special: 'a=b&c=d' });
    expect(result).to.include('query=hello+world');
    expect(result).to.include('special=a%3Db%26c%3Dd');
  });

  it('[BSPG] handles boolean values', function () {
    const result = buildSearchParams({ active: true, disabled: false });
    expect(result).to.equal('active=true&disabled=false');
  });

  it('[BSPH] handles empty arrays', function () {
    const result = buildSearchParams({ tags: [], name: 'test' });
    expect(result).to.equal('name=test');
  });
});
