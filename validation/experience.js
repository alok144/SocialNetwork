var validator = require("validator");
var isEmpty = require("./isempty.js");

module.exports = function validateExperienceInput(data){
    let errors = {};
    data.title =  !isEmpty(data.title) ? data.title : "";
    data.company =  !isEmpty(data.company) ? data.company : "";
    data.from =  !isEmpty(data.from) ? data.from : "";
    data.description =  !isEmpty(data.description) ? data.description : "";    

    if(validator.isEmpty(data.title)){
        errors.title = "title is required";
    }

    if(validator.isEmpty(data.company)){
        errors.company = "company is required"; 
    }

    if(validator.isEmpty(data.from)){
        errors.from = "Date of starting is required"; 
    }

    if(validator.isEmpty(data.description)){
        errors.description = "Description is required"; 
    }

    return {  
        errors: errors,
        isValid: isEmpty(errors)
    } 
};    