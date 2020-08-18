var validator = require("validator");
var isEmpty = require("./isempty.js");

module.exports = function validateLoginInput(data){
    let errors = {};
    data.email =  !isEmpty(data.email) ? data.email : "";
    data.password =  !isEmpty(data.password) ? data.password : "";


    
    if(!validator.isEmail(data.email)){
        errors.email = "email is invalid" 
    }
    if(validator.isEmpty(data.email)){
        errors.email = "email field is required" 
    }

    if(validator.isEmpty(data.password)){
        errors.password = "Password field is required" 
    }

    return {  
        errors: errors,
        isValid: isEmpty(errors)
    } 
};   