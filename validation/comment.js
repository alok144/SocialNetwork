var validator = require("validator");
var isEmpty = require("./isempty.js");

module.exports = function validateCommentInput(data){
    let errors = {};
    data.text =  !isEmpty(data.text) ? data.text : "";

    if(!validator.isLength(data.text, {min:10, max:300})){
        errors.text= "Comment must be between 10 to 100 characters";
    }

    if(validator.isEmpty(data.text)){
        errors.text = "Text field is required";
    }

    return {  
        errors: errors,
        isValid: isEmpty(errors)
    } 
};   