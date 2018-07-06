const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("express-flash-messages");

// setup exress app
const app = express();
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 4000,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";
console.log('suneel: env variables mongoURL',mongoURL);
if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase; 

  }
}
console.log('suneel: just before calling...mongoURL, mongoURL);
            
var initDb = function(callback) {
  if (mongoURL == null) mongoURL = 'mongodb://localhost/vendormgt';

  //mongoose.connect('mongodb://localhost/ninjago');
  mongoose.connect(mongoURL);  //connect to mongo db using mongoose DB: ninjago
  mongoose.Promise = global.Promise;

  /*mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    } 

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';
    */

    console.log('Connected to MongoDB at: %s', mongoURL);
};
initDb();





app.set('view engine','ejs');     // Set view engine for app
app.use(express.static('public')); // set up public folder for static files

app.use(session({
  secret: "This is secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./passportconfig').configure(passport);


//Include or use body-parser middleware
//Order of app.use is very important
//usage is based on the order.  This will be available in all the routes
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '16mb'
}));
app.use(bodyParser.json({limit: '16mb'}));


//Configure routes.  Access all get/post calls by /api/xxxxx
app.use('/',require("./routes/api"));

//error handling middleware
//There is no default package used console.error;
//instead a custom function is created to handle error or exceptions
app.use(function(err, req, res, next){
  //Update the status code and also throw message received from err object
  console.log(err);
  res.status(422).send({Error: err.message});
});

// Use environment variable 'port' if it is set or use 4000
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

