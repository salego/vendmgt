const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  phoneno: {
    type: Number,
    unique: true,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['security','admin','superadmin','staff'],
    required: true,
    default: 'security'
  },
  userid: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  createdon: {
    type: Date,
    default: Date.now
  }
});

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

// define a method 'authenticate' on schema level to validate password
UserSchema.methods.authenticate = function(password){
  return bcrypt.compareSync(password, this.password)
}

// define a method 'authenticate' on the user object
UserSchema.statics.authenticate = function(userid, password, done){
  this.findOne({userid: userid},function(err, user){
    if (err){
      console.log('User Schema - Error authenticating user', err);
      done(err);
    } else if (user && user.authenticate(password)){
      console.log('User Schema - sucessfully logged');
      done(null, user);
    } else {
      console.log('User Schema - probably got  their password wrong');
      done(null,false);
    }
  });
}

const User = mongoose.model('users', UserSchema);
module.exports = User;
