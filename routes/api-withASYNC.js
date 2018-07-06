const express = require("express");
const router = express.Router();
//const vendors = require("../models/vendors");
//const Vendor = vendors.Vendor;
//const VendorRep = vendors.VendorRep;
const Vendor = require("../models/vendors");
const VendorRep = require("../models/vendorReps");
const User = require("../models/user");
const VisitHistory = require("../models/visitTrans");
const passport = require("passport");
const fs = require('fs');
const async = require('async'); // DB calls are async

router.get('/login', function(req,res,next){
  const flashMessages = res.locals.getMessages();
  console.log('Flash-Message: ',flashMessages);

  if (flashMessages.error){
    res.render('login', {user: req.user, showErrors: true, errors: flashMessages.error});
  } else {
    res.render('login', {user: req.user, showErrors: false});
  }
});

router.post('/login', passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/login',
  failureFlash: true
}));

// This Function will ensure that:
// 1. If there is no user data in the session, user will be directed to login page
// 2. If there is user data in the session with role as admin, will redirect to corresponding page
function adminAuthRequired(req, res, next){
    //console.log('Is req.user ?', req.user);
    if(!req.user){
        res.redirect('login');
    } else {
        if (req.user.role == 'admin') {
            next();
        }
        else {
            res.redirect('/login');
        }
    }
}

router.get('/login-register', adminAuthRequired, function (req, res, next){
    const flashMessages = res.locals.getMessages();
    console.log('Flash-Message-get-login-register : ',flashMessages);
  
    roleNames = [{name:'security'},{name:'admin'},{name:'staff'}]
    if (flashMessages.error){
        res.render('login-register',{
                roles: roleNames
            ,   user: req.user
            ,   showErrors: true
            ,   alertType: 'alert-danger'
            ,   errors: flashMessages.error
        });  //Populate drop-down with roles    
    } else if (flashMessages.success){
        res.render('login-register',{
            roles: roleNames
        ,   user: req.user
        ,   showErrors: true
        ,   alertType: 'alert-success'
        ,   errors: flashMessages.success
        });  //Populate drop-down with roles        
    } else {
        res.render('login-register',{
            roles: roleNames
        ,   user: req.user
        ,   showErrors: false
        });  //Populate drop-down with roles        
        
    }
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
      , role: req.body.role
    }

    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
          if (err.message.indexOf ('duplicate key error') > -1){
            req.flash('error', 'User ID / email / Phone number is already in use');
          } else {
            req.flash('error', 'System error while creating User.');
          }
        res.redirect('login-register');
      } else {
        req.flash('success', 'User successfully created.');
        res.redirect('login-register'); //If redirect is used, user details are automatically included
      }
    });
}
});


// This Function will ensure that:
// 1. If there is no user data in the session, user will be directed to login page
// 2. If there is user data in the session with role as admin, will redirect to corresponding page
function securityAuthRequired(req, res, next){
    //console.log('Is req.user ?', req.user);
    if(!req.user){
        res.redirect('login');
    } else {
        if (req.user.role == 'security') {
            next();
        }
        else {
            res.redirect('/login');
        }
    }
}


//get (New) vendor registration form
router.get('/vendor-reg', securityAuthRequired, function(req,res,next){
    console.log("vendor reg...");
    res.render('vendorReg',{user:req.user}); //Populate vendor photo id types
});
  
// Save vendor registration form details
router.post('/vendor-reg', function(req,res,next){
    // if Vendor.create function fails for whatever reason, call 'next'
    // middleware defined in index.js
    var vendorData = {
            company: req.body.company
        ,   phoneNo: req.body.phoneNo
        ,   address: req.body.address
    }
    Vendor.create(vendorData, function(err, vendor){
        if (err) {
            return next(err);
        } else {
            res.redirect('./profile');
        }
    });
});
  
// Vendor Rep Registration form
router.get('/vendor-rep-reg', securityAuthRequired, function(req, res, next){
    console.log('inside vendor-rep-get GET...');
    photoIdTypes = [{idType: 'Aadhar ID'},
        {idType: 'Driving license'},
        {idType: 'Voter ID'},
        {idType: 'Ration Card'}];
    //Get vendors list    
    Vendor.find({}, function(err, vendors){
        //Get 'staff' list from users
        User.find({role:'staff'}, function(err, users){
            console.log(users);
            res.render('vendorRepReg', {user: req.user, vendorList:vendors, staffList:users, types: photoIdTypes});
        });
    });

});

router.post('/vendor-rep-reg', function(req, res, next){
    console.log('From Inside Vendor Rep Registration POST');
    var vendorRepData = new VendorRep ({
            name:       req.body.name
        ,   phoneNo:    req.body.phoneNo
        ,   photoIdType:    req.body.photoIdType
        ,   photoId:    req.body.photoId
        ,   vendorId:  req.body.vendor_id
    });
    console.log('vendor name from hidden: ', req.body.hVendor_name);
    var repTrans = new VisitHistory ({
            vendorId:   req.body.vendor_id
        ,   repId: ''
        ,   staffId:    req.body.staff_id
        ,   vendorName: req.body.hVendor_name
        //,   vendorPhoneNo:  req.body.
        ,   repName: req.body.name
        ,   repPhoneNo: req.body.phoneNo
        ,   staffName: req.body.hStaff_name
        //,   staffPhoneNo: req.body.
    });
    console.log('Before updateing _id: ', repTrans);
    VendorRep.create(vendorRepData, function(err, repInstance){
        if(!err){
            console.log('Rep created sucessfully, will insert History');
            repTrans.repId = repInstance._id;
            console.log('Visit Histroty Data: ', repTrans);
            VisitHistory.create(repTrans, function(err, histInstance){
                if(!err){
                    console.log('History created successfully');
                    res.redirect('/profile');
                } else {
                    console.log('Error while inserting History', err);
                    res.redirect('/profile');
                }
            });
        }
    });
});

router.post('/vendor-rep-reg-old', function(req, res, next){
    console.log('inside vendor-rep-reg POST');
    var vendorRepData = new VendorRep ({
            name:       req.body.name
        ,   phoneNo:    req.body.phoneNo
        ,   photoIdType:    req.body.photoIdType
        ,   photoId:    req.body.photoId
        ,   vendorId:  req.body.vendor_id
        ,   visitDetails:   {staff_id: req.body.staff_id}  
    });
    vendorRepData.save(function(err){
        if(err){
            return next(err);
        } else {
            res.redirect('/profile');
        }
    });
});

router.get('/vendor-rep-visit', function(req, res, next){
    VendorRep
    .find({},['_id','name','vendorId'],{sort:{name:1}})
    .exec (function(err, vendorReps){
        var repDetails=[];
        async.each(vendorReps,function(vendorRep,callback){
            Vendor.findById(vendorRep.vendorId, function(err, vendor){
                repDetailsItem = {'repName': vendorRep.name,'repComp':vendor.company,'repAdd':vendor.address, 'repCompPh':vendor.phoneNo, 'repId': vendorRep._id};
                repDetails.push(repDetailsItem);
                callback();               
            });
        }, function(err){
            console.log('At last?', repDetails);
            res.render('vendorVisit',{user: req.user, repList:repDetails});
        });
    });
});

router.get('/get-rep-details', function(req, res, next){
    console.log('GOT AJAX request to server');
    repIdToSearch = req.query.repId;
    VisitHistory.find({'repId':repIdToSearch})
        .exec(function(err, rep){
            console.log('AJAX Response Visit History: ', rep);
            res.send(rep);
        });
            
});

/////// OLD
router.get('/get-rep-details-old',function(req,res,next){
    console.log('GOT AJAX request to server');
    repIdToSearch = req.query.repId;
    //console.log('REP ID from GET: ', repIdToSearch);
    VendorRep.find({'_id':repIdToSearch},['_id','entryRestricted', 'name','phoneNo','visitDetails']).exec(function(err,rep){
        var repVisits=[];
        async.each(rep,function(visit,callback){
            visitDet = [];
            visitDet = visit.visitDetails; 
            console.log('Rep visit details breakup-2: ', visitDet);
            visitDet.forEach(function(contact){
                console.log( 'contact: '+contact);
                User.findById(contact.staff_id, function(err,staff){
                    staffItem = {'visitDate':contact.visitDate,'visitStatus':contact.visitStatus,'staffName': staff.username,'staffPh':staff.phoneno};
                    repVisits.push(staffItem);
                    console.log('Visits from inside async: ', repVisits);
                    callback();
                });    
            });
        }, function(err){
            console.log('Vists : ', repVisits);   
            res.send(repVisits);
        }
        );
    });
    
});

router.get('/get-staff-list', function(req, res, next){
    console.log('GOT AJAX request for Staff');
    User.find({'role':'staff'}).exec(function(err,contacts){
        console.log('Staff items : ', contacts);
        res.send(contacts);
    });
});


router.get('/vendor-check', function(req,res,next){
    res.render('vendor-check',{user: req.user});
});

router.post('/vendor-check', function (req, res, next){
    //console.log('Data URL received : ', req.body.img);
    var dataUrl = req.body.img;
    //console.log('Data URL content: ', dataUrl);
    var matches = dataUrl.match(/^data:.+\/(.+);base64,(.*)$/);
    var buffer = new Buffer(matches[2], 'base64');

    fs.writeFileSync('./tmp/1.png', buffer);
    console.log('File writing completed..');
    res.redirect('./profile');
});

router.get('/profile', function(req, res, next){
    console.log(req.user,'Invoking profile render');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render('profile', {user: req.user});
});

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/login');
})



module.exports = router;
