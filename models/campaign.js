var mongoose = require("mongoose");

var campaignSchema = new mongoose.Schema({
	title: String,
	image: String,
	start_time: Date,
	end_time: Date,
	stamps_needed: Number,
	description: String,
	reward: String,
	company: String,
	identifiers: [String]
});

module.exports = mongoose.model("Campaign", campaignSchema);