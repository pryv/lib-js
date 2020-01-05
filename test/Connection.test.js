const should = chai.should();
const expect = chai.expect;


const testData = require('./test-data.js');

const conn = new Pryv.Connection(testData.pryvApiEndPoints[0]);

describe('Connection', () => {

  describe('.api()',  () => {
    it('.api() events.get', async () => {
      const res = await conn.api(
        [
          {
            "method": "events.get",
            "params": {}
          }
        ]);
      res.length.should.equal(1);
    });

    it('.api() events.get split in chunks', async () => {
      conn.options.chunkSize = 2;
      const res = await conn.api(
        [
          { "method": "events.get", "params": {} },
          { "method": "events.get", "params": {} },
          { "method": "events.get", "params": {} }
        ]);
      res.length.should.equal(3);

    });

    it('.api() with callbacks', (done) => {
      conn.api(
        [
          { "method": "events.get", "params": {} }
        ]).then((res) => {
          res.length.should.equal(1);
          done();
        }, (err) => {
          should.not.exist(err);
          done();
        });

    });
  });

  describe('.get()', () => {
    it ('/events', async () => { 
      const res = await conn.get('events',{limit: 1});
      res.events.length.should.equal(1);
    });

  });

  describe('time', () => {
    it('deltatime property', async () => {
      await conn.get('events', { limit: 1 });
      const deltaTime = conn.deltaTime; 
      expect(Math.abs(deltaTime) < 2).to.be.true;
    });
  });

  describe('API', () => {
    it('endpoint property', async () => {
      const apiEndpoint = conn.apiEndpoint;
      expect(apiEndpoint.startsWith('https://' + conn.token + '@')).to.be.true;
    });
  });

});