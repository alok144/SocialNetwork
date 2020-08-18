var validator = require("validator");
var isEmpty = require("./isempty.js");

module.exports = function validateProfileInput(data){
    let errors = {};
    data.handle =  !isEmpty(data.handle) ? data.handle : "";
    data.status =  !isEmpty(data.status) ? data.status : "";
    data.skills =  !isEmpty(data.skills) ? data.skills : "";
    // data.company =  !isEmpty(data.company) ? data.company : "";
    // data.website =  !isEmpty(data.website) ? data.website : "";
    // data.location =  !isEmpty(data.location) ? data.location : "";
    // data.bio =  !isEmpty(data.bio) ? data.bio : "";
    // data.githubusername =  !isEmpty(data.githubusername) ? data.githubusername : "";

    if(!validator.isLength(data.handle, {min:2, max:20})){
        errors.handle= "handle must be between 2 to 20 characters";
    }

    if(validator.isEmpty(data.handle)){
        errors.handle = "handle is required";
    }

    if(validator.isEmpty(data.status)){
        errors.status = "status is required"; 
    }

    if(validator.isEmpty(data.skills)){
        errors.skills = "skills is required"; 
    }

    if(!isEmpty(data.website)){
        if(!validator.isURL(data.website)){
            errors.website = "Not a valid URL";
        } 
    }

    if(!isEmpty(data.linkedin)){
        if(!validator.isURL(data.linkedin)){
            errors.linkedin = "Not a valid URL";
        } 
    }

    if(!isEmpty(data.twitter)){
        if(!validator.isURL(data.twitter)){
            errors.twitter = "Not a valid URL";
        } 
    }

    if(!isEmpty(data.facebook)){
        if(!validator.isURL(data.facebook)){
            errors.facebook = "Not a valid URL";
        } 
    }

    if(!isEmpty(data.instagram)){
        if(!validator.isURL(data.instagram)){
            errors.instagram = "Not a valid URL";
        } 
    }

    if(!isEmpty(data.youtube)){
        if(!validator.isURL(data.youtube)){
            errors.youtube = "Not a valid URL";
        } 
    }

    return {  
        errors: errors,
        isValid: isEmpty(errors)
    } 
};    