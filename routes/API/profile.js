var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    passport = require("passport");

//Load Input Validation
var validateProfileInput = require("../../validation/profile.js");
var validateExperienceInput = require("../../validation/experience.js");
var validateEducationInput = require("../../validation/education.js");

//Load user model
var User=  require("../../models/User.js");
//Load profile model
var Profile=  require("../../models/Profile.js");

//@route GET api/profile/test
//@desc Tests profile route
//@access public
router.get("/test", (req, res) => res.json({msg: "Profile Works"}));

//@route GET api/profile
//@desc get current user's profile
//@access private

router.get("/", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    var errors = {};
    Profile.findOne({user: req.user.id})
    .populate("user",["name","avatar"])
    .then(profile => {
        if(!profile){
            errors.noprofile = "there is no profile for this user";
            return res.status(404).json(errors);
        } else {
            res.json(profile);
        }
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/profile/handle/:handle
//@desc get profile by handle
//@access public
router.get("/handle/:handle", (req, res) => {
    var errors = {};
    Profile.findOne({handle: req.params.handle})
    .populate("user",["name","avatar"])
    .then(profile => {
        if(!profile){
            errors.noprofile = "there is no profile for this user";
            return res.status(404).json(errors);
        } else {
            res.json(profile);
        }
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/profile/user/:user_id
//@desc get profile by user ID
//@access public
router.get("/user/:user_id", (req, res) => {
    var errors = {};
    //we will search by user {user: req.params.user_id}
    Profile.findOne({user: req.params.user_id})
    .populate("user",["name","avatar"])
    .then(profile => {
        if(!profile){
            errors.noprofile = "there is no profile for this user";
            return res.status(404).json(errors);
        } else {
            res.json(profile);
        }
    })
    .catch(err => res.status(404).json({profile: "there is no profile for this user"}));
});

//@route GET api/profile/all
//@desc get all profiles
//@access public
router.get("/all", (req, res) => {
    var errors = {};
    Profile.find()
    .populate("user",["name","avatar"])
    .then(profiles => {
        if(!profiles){
            errors.noprofile = "there are no profiles";
            return res.status(404).json(errors);
        } else {
            res.json(profiles);
        }
    })
    .catch(err => res.status(404).json({profile: "there are no profiles"}));
});

//@route POST api/profile
//@desc create or edit user profile
//@access private
router.post("/", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    var{ errors , isValid} = validateProfileInput(req.body);
    //check validation
    if(!isValid){
        //return any errors with 404 status
        return res.status(400).json(errors);
    }

    //get fields
    var profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    //Skills Split in array
    if(typeof req.body.skills !== "undefined"){
        profileFields.skills = req.body.skills.split(",");
    }
    //Social
    profileFields.social = {};
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            //Update
            Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true})
            .then(profile => res.json(profile))
            .catch(err => res.status(404).json(err));
        } else {
            //Create
            //check if handle exists
            Profile.findOne({handle: profileFields.handle})
            .then(profile =>{
                if(profile){
                    errors.handle = "that handle already exists";
                    res.status(400).json(errors);
                } else {//save profile
                    new Profile(profileFields)
                    .save()
                    .then(profile => {
                        res.json(profile);
                    })
                    .catch(err => res.status(404).json(err));
                }
                
            })
            .catch(err => res.status(404).json(err));
        }
    })
    .catch(err => res.status(404).json(err));
});


//@route POST api/profile/experience
//@desc Add experience to profile
//@access private
router.post("/experience", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    var{ errors , isValid} = validateExperienceInput(req.body);
    //check validation
    if(!isValid){
        //return any errors with 404 status
        return res.status(400).json(errors);
    }

    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            var newExperience = {};
            if(req.body.title) newExperience.title = req.body.title;
            if(req.body.company) newExperience.company = req.body.company;
            if(req.body.location) newExperience.location = req.body.location;
            if(req.body.from) newExperience.from = req.body.from;
            if(req.body.to) newExperience.to = req.body.to;
            if(req.body.current) newExperience.current = req.body.current;
            if(req.body.description) newExperience.description = req.body.description;

            //add to experience array
            profile.experience.unshift(newExperience);
            
            profile.save()
            .then(profile => {
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));

        } else {
            res.status(404).json({profile: "there are no profiles"});
        }
    })
    .catch(err => res.status(404).json(err));
});

//@route POST api/profile/education
//@desc Add education to profile
//@access private
router.post("/education", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    var{ errors , isValid} = validateEducationInput(req.body);
    //check validation
    if(!isValid){
        //return any errors with 404 status
        return res.status(400).json(errors);
    }

    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            var newEducation = {};
            if(req.body.school) newEducation.school = req.body.school;
            if(req.body.degree) newEducation.degree = req.body.degree;
            if(req.body.fieldofstudy) newEducation.fieldofstudy = req.body.fieldofstudy;
            if(req.body.from) newEducation.from = req.body.from;
            if(req.body.to) newEducation.to = req.body.to;
            if(req.body.current) newEducation.current = req.body.current;
            if(req.body.description) newEducation.description = req.body.description;

            //add to education array
            profile.education.unshift(newEducation);
            
            profile.save()
            .then(profile => {
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));

        } else {
            res.status(404).json({profile: "there are no profiles"});
        }
    })
    .catch(err => res.status(404).json(err));
});

//@route DELETE api/profile/experience/:exp_id
//@desc delete experience from profile
//@access private
router.delete("/experience/:exp_id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            //get remove index //if their is invalid exp_id then yhis will delete last member of array
            var removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

            //splice out of array
            profile.experience.splice(removeIndex, 1);
            
            //save profile
            profile.save()
            .then(profile => {
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
        } else {
            res.status(404).json({profile: "there are no profiles"});
        }

    })
    .catch(err => res.status(404).json(err));
});

//@route DELETE api/profile/education/:edu_id
//@desc delete education from profile
//@access private
router.delete("/education/:edu_id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            //get remove index //if their is invalid exp_id then yhis will delete last member of array
            var removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

            //splice out of array
            profile.education.splice(removeIndex, 1);
            
            //save profile
            profile.save()
            .then(profile => {
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
        } else {
            res.status(404).json({profile: "there are no profiles"});
        }

    })
    .catch(err => res.status(404).json(err));
});

//@route DELETE api/profile
//@desc delete user and profile
//@access private
router.delete("/", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Profile.findOneAndRemove({user: req.user.id})
    .then(() => {
        User.findByIdAndRemove({_id: req.user.id})
        .then(() => res.json({success: true}))
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json(err));
});

module.exports= router;