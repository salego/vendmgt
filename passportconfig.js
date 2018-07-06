const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

function configure(passport) {
    const strategyFunc = function(username, password, done){
        User.authenticate(username, password,function(err, user){
            if (err){
                console.log('Local Strategy - Error authenticating user');
                done(err);
            }
            else if (user){
                console.log('Local Strategy - User Found', user.role);
                done(null, user);
            }
            else{
                console.log('Local Strategy - No user found with the login details');
                done(null,false,{
                    message: 'No User found with these login details.'
                });
            }
        })
    }
    passport.use(new LocalStrategy({
        usernameField: 'userid',
        passwordField: 'password'
      },
      strategyFunc));

    passport.serializeUser(function(user,done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id,done){
        User.findById(id, function(err, user){
            done(err,user);
        });
    });
}

module.exports = {
    configure
};