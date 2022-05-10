/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, beforeEach, afterEach, expect, Pryv, testData */
/* eslint-disable no-unused-expressions */

const cuid = require('cuid');

require('../src')(Pryv);

let conn = null;
const testStreamId = 'socket-test';

describe('Socket.IO', function () {
  this.timeout(3000);
  let apiEndpoint;
  let apiEndpointBogusToken;
  let apiEndpointBogusUsername;

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
    apiEndpoint = testData.apiEndpointWithToken;
    apiEndpointBogusToken = Pryv.Service.buildAPIEndpoint(testData.serviceInfo, testData.username, 'toto');
    apiEndpointBogusUsername = Pryv.Service.buildAPIEndpoint(testData.serviceInfo, 'totototototo', testData.token);
  });

  before(async () => {
    conn = new Pryv.Connection(apiEndpoint);
    const res = await conn.api([{
      method: 'streams.create',
      params: {
        id: testStreamId,
        name: testStreamId
      }
    }]);
    expect(res[0]).to.exist;
    if (res[0].stream) return;
    expect(res[0].error).to.exist;
    expect(res[0].error.id).to.equal('item-already-exists');
  });

  describe('init on invalid endpoint', () => {
    it('Should throw an error "Not Found" or ENOTFOUND when user is not known', async () => {
      conn = new Pryv.Connection(apiEndpointBogusUsername);
      try {
        await conn.socket.open();
      } catch (e) {
        if (e.message === 'Not Found' || e.message.startsWith('getaddrinfo ENOTFOUND')) {
          return;
        }
        throw new Error('Error message should be NotFound or ENOTFOUND and received: ' + e.message);
      }
      throw new Error('Should throw an error');
    });

    it('Should throw an error "Unauthorized" when token is invalid', async () => {
      conn = new Pryv.Connection(apiEndpointBogusToken);
      try {
        await conn.socket.open();
      } catch (e) {
        return expect(e.response.text).to.include('Cannot find access from token.');
      }
      throw new Error('Should throw an error');
    });
  });

  describe('init on valid endpoint', () => {
    beforeEach(async () => {
      conn = new Pryv.Connection(apiEndpoint);
    });

    afterEach(() => {
      conn = null;
    });

    it('Should throw an error if conn.socket.api() is called before being open()', async () => {
      try {
        await conn.socket.api([{ method: 'events.get', params: {} }]);
      } catch (e) {
        return expect(e.message).to.equal('Initialize socket.io with connection.socket.open() before');
      }
      throw new Error('Should throw an error');
    });

    it('Should throw an error if conn.socket.on() is called before being open()', async () => {
      try {
        await conn.socket.on('eventsChanged');
      } catch (e) {
        return expect(e.message).to.equal('Initialize socket.io with connection.socket.open() before');
      }
      throw new Error('Should throw an error');
    });

    it('Correct initialization should return socket instance', async () => {
      const socket = await conn.socket.open();
      expect(socket._io).to.exist;
    });
  });

  describe('socket.api', () => {
    before(async () => {
      conn = new Pryv.Connection(apiEndpoint);
      await conn.socket.open();
    });

    after(() => {
      conn = null;
    });

    it('Handle correctly batch calls', async () => {
      const res = await conn.socket.api([{ method: 'streams.get', params: {} }]);
      expect(res[0]).to.exist;
      expect(res[0].streams).to.exist;
    });

    // we don't test further .api() as it relies on the implementation of Pryv.Connection
  });

  describe('notification', () => {
    before(async () => {
      conn = new Pryv.Connection(apiEndpoint);
      await conn.socket.open();
    });

    after(() => {
      conn = null;
    });

    it('Fails on requesting an invalid notifcation', async () => {
      try {
        conn.socket.on('Bogus', () => {});
      } catch (e) {
        return expect(e.message).to.equal('Unkown event [Bogus]. Allowed events are: eventsChanged,streamsChanged,accessesChanged,disconnect,error');
      }
      throw new Error('Should fail');
    });

    it('Catches eventChanges', (done) => {
      function onEventChanged () {
        return done();
      }
      conn.socket.on('eventsChanged', onEventChanged);
      conn.api([{ method: 'events.create', params: { type: 'note/txt', streamId: testStreamId } }]);
    });

    it('Catches streamChanges', (done) => {
      function onStreamChange () {
        return done();
      }
      conn.socket.on('streamsChanged', onStreamChange);
      conn.api([{ method: 'streams.create', params: { id: cuid(), name: cuid(), parentId: testStreamId } }]);
    });

    /** Keep this test the last on of this sequence */
    it('Catches disconnect', (done) => {
      function onDisconnect (reason) {
        expect(reason).to.equal('io client disconnect');
        return done();
      }
      conn.socket.on('disconnect', onDisconnect);
      conn.socket.close();
    });
  });
});
