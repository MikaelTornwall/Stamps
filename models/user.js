var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var mongooseTypeEmail = require("mongoose-type-email");

var userSchema = new mongoose.Schema({
	image: String,
	username: String,
	password: String,
	email: mongoose.SchemaTypes.Email,
	role: Boolean,
	signup_time: Date
});

userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", userSchema);