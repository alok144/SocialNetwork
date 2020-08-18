var jwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    mongoose = require("mongoose"),
    User =  mongoose.model("User"),
    keys = require("../config/keys.js");

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports= (passport) => {
    passport.use(new jwtStrategy(opts, (jwt_payload, done) => {     
        //console.log(jwt_payload);
        User.findById(jwt_payload.id)
        .then(user => {
            if(user){
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => console.log(err));
    }));
};