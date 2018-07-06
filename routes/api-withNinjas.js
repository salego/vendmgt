const express = require("express");
const router = express.Router();
const Vendor = require("../models/vendors");
const User = require("../models/user");
const Ninja = require("../models/ninja");
const passport = require("passport");


router.get('/login', function(req,res,next){
  const flashMessages = res.locals.getMessages();
  console.log('Flash-Message: ',flashMessages);
  res.render('login');
});

router.post('/login', passport.authenticate('local',{
  successRedirect:'/login-register',
  failureRedirect:'/',
  failureFlash: true
}));

router.get('/login-register', function (req, res, next){
  roleNames = [{name:'security'},{name:'admin'}]
  res.render('login-register',{roles: roleNames});  //Populate drop-down with roles
});

router.post('/login-register', function(req, res, next){
  if (req.body.email &&
  req.body.username &&
  req.body.password &&
  req.body.userid &&
  req.body.phoneno) {
    var userData = {
        email: req.body.email
      , username: req.body.username
      , phoneno: req.body.phoneno
      , userid: req.body.userid
      , password: req.body.password
      , passwordConf: req.body.passwordConf
    }

    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        return next(err);
      } else {
        res.send("Success");
        //return res.redirect('/api/profile');
      }
    });
}
});


//get vendor registration form
router.get('/vendor-register', function(req,res,next){
  console.log("vendor registration...");
photoIdTypes = [{idType: 'Aadhar ID'},
                {idType: 'Driving license'},
                {idType: 'Voter ID'},
                {idType: 'Ration Card'}]
  res.render('registerVendor',{types: photoIdTypes}); //Populate vendor photo id types
});

// Save vendor registration form details
router.post('/vendor-create', function(req,res,next){
  // if Vendor.create function fails for whatever reason, call 'next'
  // middleware defined in index.js
  Vendor.create(req.body).then(function(vendor){
    res.send(vendor);
  }).catch(next);
});


router.get('/profile', function(req, res, next){
  res.send("Hello");
});
//get list of ninjas
router.get('/ninjas', function(req,res,next){
  res.send({type:"GET"});
});

//Create ninjas
router.post('/ninjas', function(req,res,next){
  // if Ninja.create function fails for whatever reason, call 'next'
  // middleware defined in index.js
  Ninja.create(req.body).then(function(ninja){
    res.send(ninja);
  }).catch(next);
});


//update ninja.  findByIdAndUpdate returns 'ninja' object which is before updated
// in order to see the updated document, call findOne function after 'update'
router.put('/ninjas/:ninjaID', function(req,res,next){
  Ninja.findByIdAndUpdate({_id:req.params.ninjaID},req.body).then(function(){
    Ninja.findOne({_id:req.params.ninjaID}).then(function(ninja){
      res.send(ninja);
    });
  });
});

//delete ninja
router.delete('/ninjas/:ninjaID', function(req,res,next){
  Ninja.findByIdAndRemove({_id:req.params.ninjaID}).then(function(ninja){
    res.send(ninja);
  });
})

module.exports = router;
