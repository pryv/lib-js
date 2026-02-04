/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const jsonParser = require('../src/lib/json-parser');
const { EventEmitter } = require('events');

// Helper to create a mock response stream
function createMockResponse (chunks) {
  const emitter = new EventEmitter();
  emitter.setEncoding = function () {};

  // Emit chunks asynchronously
  setTimeout(() => {
    chunks.forEach(chunk => emitter.emit('data', chunk));
    emitter.emit('end');
  }, 0);

  return emitter;
}

describe('[JPSX] json-parser', function () {
  it('[JPSA] parses single event correctly', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"events":[{"id":"evt1","type":"note/txt"}],"meta":{"serverTime":1234567890}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(1);
      expect(events[0].id).to.equal('evt1');
      expect(body.eventsCount).to.equal(1);
      done();
    });
  });

  it('[JPSB] parses multiple events', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"events":[{"id":"e1"},{"id":"e2"},{"id":"e3"}],"meta":{"serverTime":123}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(3);
      expect(body.eventsCount).to.equal(3);
      done();
    });
  });

  it('[JPSC] handles chunked data', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    // Split JSON across multiple chunks
    const chunks = [
      '{"events":[{"id":"ev',
      '1","type":"test"},{"i',
      'd":"ev2"}],"meta":{"serverTime":1}}'
    ];
    const mockRes = createMockResponse(chunks);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(2);
      expect(events[0].id).to.equal('ev1');
      expect(events[1].id).to.equal('ev2');
      done();
    });
  });

  it('[JPSD] handles empty events array', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"events":[],"meta":{"serverTime":123}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(0);
      expect(body.eventsCount).to.equal(0);
      done();
    });
  });

  it('[JPSE] handles events with nested objects', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"events":[{"id":"e1","content":{"nested":{"deep":"value"}}}],"meta":{"serverTime":1}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(1);
      expect(events[0].content.nested.deep).to.equal('value');
      done();
    });
  });

  it('[JPSF] handles events with strings containing special chars', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"events":[{"id":"e1","content":"line1\\nline2\\twith\\\\backslash"}],"meta":{"serverTime":1}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(1);
      expect(events[0].content).to.include('line1');
      done();
    });
  });

  it('[JPSG] includes eventDeletions when includeDeletions is true', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), true);

    // Split data into chunks to simulate real HTTP streaming
    // The parser needs multiple data events to process state transitions correctly
    const chunks = [
      '{"events":[{"id":"e1"}]',
      ',"eventDeletions":[{"id":"del1"}]',
      ',"meta":{"serverTime":1}}'
    ];
    const mockRes = createMockResponse(chunks);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(2);
      expect(body.eventsCount).to.equal(1);
      expect(body.eventDeletionsCount).to.equal(1);
      done();
    });
  });

  it('[JPSH] handles invalid JSON gracefully', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = 'not valid json';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.exist;
      expect(err.rawResponse).to.exist;
      expect(err.statusCode).to.equal(200);
      done();
    });
  });

  it('[JPSI] handles events with quoted strings containing brackets', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"events":[{"id":"e1","content":"text with {braces} and [brackets]"}],"meta":{"serverTime":1}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(events).to.have.lengthOf(1);
      expect(events[0].content).to.include('{braces}');
      done();
    });
  });

  it('[JPSJ] preserves meta and other root properties', function (done) {
    const events = [];
    const parser = jsonParser((event) => events.push(event), false);

    const jsonData = '{"someProperty":"value","events":[{"id":"e1"}],"meta":{"serverTime":123,"apiVersion":"1.2.3"}}';
    const mockRes = createMockResponse([jsonData]);
    mockRes.statusCode = 200;

    parser(mockRes, (err, body) => {
      expect(err).to.be.undefined;
      expect(body.someProperty).to.equal('value');
      expect(body.meta.apiVersion).to.equal('1.2.3');
      done();
    });
  });
});
