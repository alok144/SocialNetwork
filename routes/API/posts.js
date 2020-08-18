var express= require("express"),
    router= express.Router(),
    mongoose = require("mongoose"),
    passport = require("passport");

//Load Input Validation
var validatePostInput = require("../../validation/post.js");
var validateCommentInput = require("../../validation/comment.js");

//Load user model
//var User=  require("../../models/User.js");
//Load profile model
var Profile=  require("../../models/Profile.js");
//Load post model
var Post=  require("../../models/Post.js");

//@route GET api/posts/test
//@desc Tests posts route
//@access public
router.get("/test", (req, res) => res.json({msg: "Posts Works"}));

//@route GET api/posts
//@desc get all posts
//@access public
router.get("/", (req, res) => {
    
    Post.find()
    .sort({date: -1})
    .then(posts => {
        res.json(posts);
    })
    .catch(err => res.status(404).json({nopostsfound: "No posts found.... "}));
    
});

//@route GET api/posts/:id
//@desc get post by id
//@access public
router.get("/:id", (req, res) => {
    
    Post.findById(req.params.id)
    .then(post => {
        res.json(post);
    })
    .catch(err => res.status(404).json({nopostfound: "No post found with that id"}));
    
});


//@route POST api/posts
//@desc create post
//@access private
router.post("/", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    var{ errors , isValid} = validatePostInput(req.body);
    //check validation
    if(!isValid){
        //return any errors with 400 status
        return res.status(400).json(errors);
    }

    var newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save()
    .then(post => {
        res.json(post);
    })
    .catch(err => res.status(404).json(err));
    
});

//@route DELETE api/posts/:id
//@desc delete post
//@access private
router.delete("/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //check for post owner
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({notauthorized: "User not authorized"});
            }
            else{
                post.remove()
                .then(() => res.json({success: true}))
                .catch(err => res.status(404).json(err));
            }
        })
        .catch(err => res.status(404).json({postnotfound: "No post found...."}));
    })
    .catch(err => res.status(404).json({profilenotfound: "No profile found...."}));
});

//@route POST api/posts/like/:id
//@desc Like post
//@access private
router.post("/like/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({alreadyliked: "User already liked this post"});
            }
            else{
                //Add user id to likes array
                post.likes.unshift({user: req.user.id}); 
                post.save()
                .then(post => res.json(post))
                .catch(err => res.status(404).json(err));
            }
        })
        .catch(err => res.status(404).json({postnotfound: "post not found...."}));
    })
    .catch(err => res.status(404).json({profilenotfound: "No profile found...."}));
    
});

//@route POST api/posts/unlike/:id
//@desc Like post
//@access private
router.post("/unlike/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                return res.status(400).json({notliked: "You have not yet liked this post"});
            }
            else{
                //Get remove index
                var removeIndex = post.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);

                //splice out of array
                post.likes.splice(removeIndex, 1);

                post.save()
                .then(post => res.json(post))
                .catch(err => res.status(404).json(err));
            }
        })
        .catch(err => res.status(404).json({postnotfound: "post not found...."}));
    })
    .catch(err => res.status(404).json({profilenotfound: "No profile found...."}));
    
});

//@route POST api/posts/comments/:id
//@desc Add comment to post
//@access private
router.post("/comment/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    var{ errors , isValid} = validateCommentInput(req.body);
    //check validation
    if(!isValid){
        //return any errors with 400 status
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
    .then(post => {
        var newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        };

        //Add to comments array
        post.comments.unshift(newComment);

        post.save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json(err));

    })
    .catch(err => res.status(404).json({postnotfound: "No post found...."}));
    
});

//@route DELETE api/posts/comments/:id/:comment_id
//@desc Remove comment from post
//@access private
router.delete("/comment/:id/:comment_id", passport.authenticate("jwt", {session: false}), (req, res) => {
    
    Post.findById(req.params.id)
    .then(post => {
        
        //check to see if comment exists
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
            return res.status(404).json({commentnotexists: "Comment does not exists"});
        }
        else {
            //check for comment owner and post owner
            if((post.user.toString() === req.user.id)
            || (post.comments.filter(comment => comment.user.toString() === req.user.id).length > 0)) {
                //Get remove index
                var removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);
                
                //splice out of array
                post.comments.splice(removeIndex, 1);
                
                post.save()
                .then(post => res.json(post))
                .catch(err => res.status(404).json(err));
            }
            else{
                return res.status(401).json({notauthorized: "User not authorized"});
            }
        }

    })
    .catch(err => res.status(404).json({postnotfound: "No post found...."}));
    
});

module.exports= router;