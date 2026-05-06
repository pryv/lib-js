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

  it('[PERF] structured fields default to undefined for legacy constructor', function () {
    const error = new PryvError('Test');
    expect(error.id).to.be.undefined;
    expect(error.status).to.be.undefined;
    expect(error.response).to.be.undefined;
  });

  it('[PERG] fromApiResponse populates id/status/response from API body', function () {
    const fakeResponse = { status: 404 };
    const body = { error: { id: 'unknown-user', message: 'Unknown user' } };
    const error = PryvError.fromApiResponse(fakeResponse, body);
    expect(error).to.be.instanceOf(PryvError);
    expect(error.id).to.equal('unknown-user');
    expect(error.status).to.equal(404);
    expect(error.response).to.deep.equal({ body, status: 404 });
    expect(error.message).to.equal('Unknown user');
    expect(error.innerObject).to.be.undefined;
  });

  it('[PERH] fromApiResponse falls back to a generic message when body has no error', function () {
    const fakeResponse = { status: 500 };
    const error = PryvError.fromApiResponse(fakeResponse, { foo: 'bar' });
    expect(error.id).to.be.undefined;
    expect(error.status).to.equal(500);
    expect(error.message).to.match(/HTTP 500/);
  });

  it('[PERI] fromApiResponse handles null/undefined body without throwing', function () {
    const fakeResponse = { status: 502 };
    const error = PryvError.fromApiResponse(fakeResponse, undefined);
    expect(error.status).to.equal(502);
    expect(error.response).to.deep.equal({ body: undefined, status: 502 });
  });
});
