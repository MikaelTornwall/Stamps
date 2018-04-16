var mongoose = require("mongoose");

var campaignSchema = new mongoose.Schema({
	title: String,
	image: String,
	start_time: Date,
	end_time: Date,
	description: String,
	reward: String,
	stamps_needed: Number,
	requests: [{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Stamp"
		},
		username: String
	}]
});

module.exports = mongoose.model("Campaign", campaignSchema);