/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const PryvError = require('../src/lib/PryvError');

describe('[PERX] PryvError', function () {
  it('[PERA] creates error with message', function () {
    const error = new PryvError('Test error message');
    expect(error.message).to.equal('Test error message');
    expect(error.name).to.equal('PryvError');
    expect(error).to.be.instanceOf(Error);
    expect(error).to.be.instanceOf(PryvError);
  });

  it('[PERB] includes innerObject when provided', function () {
    const innerError = new Error('Inner error');
    const error = new PryvError('Outer message', innerError);
    expect(error.innerObject).to.equal(innerError);
  });

  it('[PERC] accepts object as innerObject', function () {
    const innerObj = { code: 'ERR_001', details: 'some details' };
    const error = new PryvError('Error with object', innerObj);
    expect(error.innerObject).to.deep.equal(innerObj);
  });

  it('[PERD] has proper stack trace', function () {
    const error = new PryvError('Stack test');
    expect(error.stack).to.exist;
    expect(error.stack).to.include('PryvError');
  });

  it('[PERE] innerObject is undefined when not provided', function () {
    const error = new PryvError('No inner');
    expect(error.innerObject).to.be.undefined;
  });
});
