/**
 * Created by wuyue on 16/10/20.
 */
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var Secrets = require('../models/secret');
var secretRouter = express.Router();
var Verify = require('./verify');
secretRouter.use(bodyParser.json());

secretRouter.route('*').all(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Key, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
})
secretRouter.route('/')

    .get(Verify.verifyOrdinaryUser,function(req,res,next){
        Secrets.find({}).populate({
            path:'postedBy',
            match: {'_id' : req.decoded._id},
        }).exec(function (err, secret) {
            if(err) return next(err);
            secret = secret.filter(function (sec) {
                return sec.postedBy;
            })
            // console.log(secret);
            // res.writeHead(200, {
            //     'Content-Type': 'text/plain'
            // });
            // res.write('<h1>your secrets profile detals:</h1>'+'</br>'+'</br>');
            // secret.forEach(function (item) {
            //     res.write("secret id: "+item._id + '</br>');
            //     res.write("secret content: "+item.secrets+ '</br>'+'</br>');
            // })
            // res.end('');
            res.json(secret);
        })
    })
    .post(Verify.verifyOrdinaryUser, function(req, res, next){
        req.body.postedBy = req.decoded._id;
        Secrets.create(req.body, function (err, secret) {
            if(err) throw err;
            console.log('secrets created');
            var id = secret._id;

            // res.writeHead(200, {
            //     'Content-Type': 'text/plain'
            // });
            //
            // res.end('Added the secret with id: ' + id);
            res.json(secret);
        })
    })
    .delete(Verify.verifyOrdinaryUser,function(req, res, next){ // this delete is for test purpose only
        Secrets.remove({}, function (err, resp) {
            if(err) throw err;
            //res.json(resp);
        })
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('<h1>Danger, this is a test method, your are deleting all the secrets from all the users</h1> ');
    });

secretRouter.route('/:secretId')
    .all(Verify.verifyOrdinaryUser)
    .put(function (req, res, next) {
        Secrets.findById(req.params.secretId, function (err, secret) {
            if(secret == null){
                var err = new Error('Could not find secret');
                err.status = 404;
                return next(err);
            }else if(secret.postedBy != req.decoded._id){
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }else{
                secret.remove();
                req.body.postedBy = req.decoded._id;
                Secrets.create(req.body, function (err, secret) {
                    if(err) throw err;
                    console.log('secrets created');
                    // res.writeHead(200, {
                    //     'Content-Type': 'text/plain'
                    // });
                    // res.end("secret updated");
                    res.json(secret);
                })
            }
        });
    })
    .delete(function (req, res, next) {
        Secrets.findById(req.params.secretId, function (err, secret) {

            if(secret == null){
                var err = new Error('Could not find secret');
                err.status = 404;
                return next(err);
            }
            else if (secret.postedBy != req.decoded._id){
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }else {
                secret.remove(function (err, resp) {
                    if(err) throw err;
                    console.log('secret ' + req.params.secretId + ' deleted');
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end("secret deleted");
                   // res.json(resp);
                });
            }

            //res.json(secret);

        })
    })
module.exports = secretRouter;