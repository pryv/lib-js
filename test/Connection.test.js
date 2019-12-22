const should = chai.should();
const expect = chai.expect();


const testData = require('./test-data.js');

const conn = new Pryv.Connection(testData.pryvApiEndPoints[0]);

describe('Connection', function () {

  describe('.api()', function () {
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

    it('.api() with callbacks', function (done) {
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

});