var validator = require("validator");
var isEmpty = require("./isempty.js");

module.exports = function validateEucationInput(data){
    let errors = {};
    data.school =  !isEmpty(data.school) ? data.school : "";
    data.degree =  !isEmpty(data.degree) ? data.degree : "";
    data.fieldofstudy =  !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
    data.from =  !isEmpty(data.from) ? data.from : "";
    data.description =  !isEmpty(data.description) ? data.description : "";    

    if(validator.isEmpty(data.school)){
        errors.school = "School is required";
    }

    if(validator.isEmpty(data.degree)){
        errors.degree = "degree is required"; 
    }

    if(validator.isEmpty(data.fieldofstudy)){
        errors.fieldofstudy = "Field of study is required"; 
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