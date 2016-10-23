/**
 * Created by wuyue on 16/10/22.
 */
var mongoose = require('mongoose');
var Secret = require('../models/secret');
var User = require('../models/user');

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var server = require('../bin/www');
var should = chai.should();
chai.use(chaiHttp);

var token1; // user1 token
var token2; // user2 token
var secretId;
describe('User', function () {
    var token;
    before(function (done) {
        User.remove({}, function (err) {
            done();
        });
    });

    describe('/GET users', function () {
        it('it should GET all the users', function (done) {
            chai.request(server).get('/users').end(function (err, res) {
                res.should.have.status(200);
                res.body.length.should.be.eql(0);
                done();
            });
        });
    });
    describe('/POST users/register', function () {
        it('it should not register a user into database without valid input', function (done) {
            var user = {
                username: 'test'
            }
            chai.request(server).post('/users/register').send(user).end(function (err, res) {
                res.should.have.status(500);
                res.body.should.have.property('err');
                res.body.err.should.have.property('message')
                done();
            });
        });
        it('it should register two users into database with valid input', function (done) {
            var user = {
                username: 'test',
                password: '111'
            }
            var user2 = {
                username: 'test2',
                password: '111'
            }
            chai.request(server).post('/users/register').send(user).end(function (err, res) {
                res.should.have.status(200);
                res.body.should.have.property('status').eql('Registration Successful!');

            });
            chai.request(server).post('/users/register').send(user2).end(function (err, res) {
                res.should.have.status(200);
                res.body.should.have.property('status').eql('Registration Successful!');

                done();
            });
        });
    });
    describe('/POST users/login', function () {
        it('it should not login user1 without valid password or username', function (done) {
            var user = {
                username: 'test',
                password: 'wrong'
            }
            chai.request(server).post('/users/login').send(user).end(function (err, res) {
                res.should.have.status(401);
                res.body.should.have.property('err');
                done();
            });
        });

        it('user1 should login with valid password or username', function (done) {
            var user = {
                username: 'test',
                password: '111'
            }
            var user2 = {
                username: 'test2',
                password: '111'
            }
            chai.request(server).post('/users/login').send(user).end(function (err, res) {
                res.should.have.status(200);
                res.body.should.have.property('token');
                token1 = res.body.token;
                //console.log(token1);
            });
            chai.request(server).post('/users/login').send(user2).end(function (err, res) {
                res.should.have.status(200);
                res.body.should.have.property('token');
                token2 = res.body.token;
                //console.log(token1);
                done();
            });
        });

    });
    describe('/POST secret', function () {
        it('it should create two secret for user1', function (done) {
            var secret = {
                secrets: "hello world"
            }
            var secret2 = {
                secrets:"how are you"
            }
            request(server)
                .post('/secret')
                .send(secret)
                .set('x-access-token', token1)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.have.property('_id');
                    secretId = res.body._id;

                });
            request(server)
                .post('/secret')
                .send(secret2)
                .set('x-access-token', token1)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('/GET secret', function () {
        it('users should GET all their secrets', function (done) {
            request(server)
                .get('/secret')
                .set('x-access-token', token1)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(2);
                    done();
            });
        });
    });
    describe('/PUT secret/:id', function () {
        it('users should update their secrets', function (done) {
            var secret = {
                secrets: "update hello world"
            }
            request(server)
                .put('/secret/'+secretId)
                .send(secret)
                .set('x-access-token', token1)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(200);
                    secretId = res.body._id;
                    done();
                });
        });
        it('users should not update other users secrets', function (done) {
            var secret = {
                secrets: "update hello world"
            }
            request(server)
                .put('/secret/'+secretId)
                .send(secret)
                .set('x-access-token', token2)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(403);
                    done();
                });
        });
        it('users should not update unexsit secret', function (done) {
            var secret = {
                secrets: "update hello world"
            }
            request(server)
                .put('/secret/'+0)
                .send(secret)
                .set('x-access-token', token1)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(404);
                    done();
                });
        });
    })
    describe('/DELETE secret/:id', function () {
        it('users should not delete other users secrets', function (done) {
            var secret = {
                secrets: "update hello world"
            }
            request(server)
                .delete('/secret/'+secretId)
                .set('x-access-token', token2)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(403);
                    done();
                });
        });
        it('users should delete their secrets', function (done) {
            request(server)
                .delete('/secret/'+secretId)
                .set('x-access-token', token1)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(200);
                    //secretId = res.body._id;
                    done();
                });
        });
        it('users should not delete unexsit secret', function (done) {
            request(server)
                .delete('/secret/'+secretId)
                .set('x-access-token', token1)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    res.should.have.status(404);
                    done();
                });
        });
    })

})