var express = require('express'), cors = require('cors'), app = express;
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify    = require('./verify');

/* GET users listing. */
router.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
})
router.get('/', function(req, res, next) {
    User.find({}, function (err, user) {
        if(err) throw err;
        res.json(user);
    })
});
router.delete('/', function(req, res, next) {
    User.remove({}, function (err, user) {
        if(err) throw err;
        res.json(user);
    })
});

router.post('/register', function(req, res) {
  User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
          return res.status(500).json({err: err});
        }
        if(req.body.firstname) {
              user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
              user.lastname = req.body.lastname;
        }
        user.save(function (err, user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Registration Successful!'});
            });
        })
      });
});


router.post('/login', function(req, res, next) {

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
      console.log(req.body);
    if (!user) {

      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken({"username":user.username, "_id":user._id});

      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
        console.log('login successful!');
    });
  })(req,res,next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
      //in the client site, token should be destroyed
    status: 'Bye!'
  });
});

module.exports = router;
