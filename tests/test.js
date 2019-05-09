const chai = require('chai');
const chaiHttp = require('chai-http');
const deepEql = require("deep-eql");
const app = require('../index');
const utils = require('../validations');

chai.use(chaiHttp);
chai.should();

describe('IPs', () => {
  describe('GET /IP/:IP', () => {

    // Test to get a valid IP (host address)
    it('should get a valid IP object back (no subnet)', (done) => {
      chai.request(app)
        .get('/IP/1.162.150.226')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.have.property('ip');
          res.body[0].should.have.property('source');
          res.body[0].should.have.property('last_upd');
          res.body[0].ip.should.equal('1.162.150.226');
          done();
        });
    });

    // Test to get a valid IP (host address + subnet)
    it('should get a valid IP object back (with subnet)', (done) => {
      chai.request(app)
        .get('/IP/193.108.20.253')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body[0].should.have.property('ip');
          res.body[0].should.have.property('source');
          res.body[0].should.have.property('last_upd');
          res.body[0].ip.should.equal('193.108.20.0/24');
          done();
        });
    });

    // Test to get an IP that does not exist
    it('should get OK back since the IP does not exist', (done) => {
      chai.request(app)
        .get('/IP/1.1.2.3')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.equal('OK');
          done();
        });
    });

    // Test to get an error in case of input format != inet
    it('should get an error for wrong inet format', (done) => {
      chai.request(app)
        .get('/IP/badformat')
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.html;
          res.text.should.equal('invalid input syntax for type inet: "badformat"');
          done();
        });
    });
  });

  describe('sync IPs', () => {
    it('should parse *.ipset files', (done) => {
      utils.isDataFile('test.ipset').should.equal(true);
      done();
    });

    it('should parse *.netset files', (done) => {
      utils.isDataFile('test.netset').should.equal(true);
      done();
    });

    it('should parse not parse *.text files', (done) => {
      utils.isDataFile('test.text').should.equal(false);
      done();
    });

    // Test function groupBy():
    // The function takes as input an array of JSON objects
    // and a function. Returns as output an 2D arrays of the 
    // same JSON objects grouped by the property that the 
    // input function pointed at
    it('should group an array of JSON {ip, source} objects, by IP', (done) => {
      const ipArray = [{ ip: '1.0.103.37', source: 'Source 1' },
        { ip: '1.0.103.37', source: 'Source 2' },
        { ip: '1.0.125.38', source: 'Source 1' },
        { ip: '1.1.176.44', source: 'Source 1' },
        { ip: '1.0.103.37', source: 'Source 3' }];
      const ipArrayGrouped = [
        [{ ip: '1.0.103.37', source: 'Source 1' },
          { ip: '1.0.103.37', source: 'Source 2' },
          { ip: '1.0.103.37', source: 'Source 3' }],
        [{ ip: '1.0.125.38', source: 'Source 1' }],
        [{ ip: '1.1.176.44', source: 'Source 1' }]];
      deepEql(utils.groupBy(ipArray, item => [item.ip]), ipArrayGrouped).should.be.true;
      done();
    });
  });
});
