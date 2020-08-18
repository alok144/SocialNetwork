var mongoose=require("mongoose");

var Schema= mongoose.Schema;  

//create schema
var userSchema= new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});
//creating model and export
module.exports= User= mongoose.model("User", userSchema);
