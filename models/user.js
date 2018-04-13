var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	image: String,
	username: String,
	password: String,
	role: Boolean,
	cards: 
		[{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Card"
		}],
	campaigns: 
		[{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Campaign"
		}],
	signup_time: Date
});

userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", userSchema);