var mongoose = require("mongoose");

var stampSchema = new mongoose.Schema({
	id: Number,
	company: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			},
			username: String
		},
	holder: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			},
			username: String
		},
	campaign: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Campaign"
			},
			title: String
		},
	requesting_time: Date,
	requesting_location: String,
	granting_time: Date,
	granting_location: String
});

module.exports = mongoose.model("Stamp", stampSchema);