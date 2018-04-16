var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	image: String,
	username: String,
	password: String,
	role: Boolean,
	cards: 
		[{
			id:{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Card"
			},
			title: String
		}],
	campaigns: 
		[{
			id:{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Campaign"
			},
			title: String
		}],
	signup_time: Date
});

userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", userSchema);