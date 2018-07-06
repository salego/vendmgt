var server   = require('../server'),
    chai     = require('chai'),
    chaiHTTP = require('chai-http'),
    should   = chai.should();

chai.use(chaiHTTP);

reqServer = process.env.HTTP_TEST_SERVER || server

describe('Basic routes tests', function() {

    it('GET to /login should return 200', function(done){
        chai.request(reqServer)
        .get('/login')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })

})
