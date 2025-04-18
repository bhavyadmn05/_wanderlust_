const mongoose = require("mongoose");
const passport = require("passport");
const Schema = mongoose.Schema;
const passportLocalMongosse = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },  
});
userSchema.plugin(passportLocalMongosse);

module.exports = mongoose.model('User',userSchema);
