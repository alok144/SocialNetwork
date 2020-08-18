const { request } = require("express");

var express= require("express"),
    router= express.Router(),// router this is provided by express framework
    gravatar= require('gravatar'),
    bcrypt= require("bcryptjs"),
    jwt= require("jsonwebtoken"),
    passport = require("passport");

//Load Input Validation
var validateRegisterInput = require("../../validation/register.js");
var validateLoginInput = require("../../validation/login.js");

//Load user model
var User=  require("../../models/User.js"),
    keys= require("../../config/keys.js");


//@route GET api/users/test
//@desc Tests users route
//@access public
router.get("/test", (req, res) => res.json({msg: "User Works"})); 

//@route POST api/users/register
//@desc Register User
//@access public
router.post("/register", (req, res) => {

    var{ errors , isValid} = validateRegisterInput(req.body);
    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    //find the user with this email
    User.findOne({ email: req.body.email })
    .then(user => {
        //if user already exist then can't rgister
        //else we will create new user
        if(user){
            errors.email = "email already exists";
            return res.status(400).json(errors);
        } else {
            var avatar= gravatar.url(req.body.email, {
                s: '200', //Size 
                r: 'pg', //Rating
                d: 'mm' //Default
            });

            var newUser= new User({
                name: req.body.name,
                email: req.body.email,
                avatar: avatar,
                password: req.body.password
            });

            // we are not storing password in our database insead we will store hash code
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err){
                        throw err;
                    } 
                    newUser.password= hash;
                    newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err))
                });
            });
        }
    });
});

//@route POST api/users/login
//@desc Login User/Returning JWT Token
//@access public
router.post("/login", (req, res) => {
    
    var{ errors , isValid} = validateLoginInput(req.body);
    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    var email= req.body.email;
    var password= req.body.password;

    //find user by email
    User.findOne({email: email})
    .then(user => {
        //check  if user found
        //else check password is correct or not
        if(!user){
            errors.email = "user not found";
            return res.status(404).json(errors);
        } else {
            bcrypt.compare(password, user.password)
            .then(isMatch => {
                if(isMatch){
                    //res.json({msg: "success"});
                    
                    //User Matched
                    //Create JWT(json web token payload)
                    var payload= {id: user._id, name: user.name, avatar: user.avatar};
                    
                    //Sign Token
                    jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token //putting bearer is just a protocol
                        });
                    });
                } else {
                    errors.password = "password incorrect";
                    return res.status(400).json(errors);
                }
            });
        }
    });
});

//@route GET api/users/current
//@desc Return current user
//@access private
router.get("/current", passport.authenticate("jwt", {session: false}), (req, res) => {
    //res.json({msg: "success"});
    //res.json(req.user);
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports= router;

