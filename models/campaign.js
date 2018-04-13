var mongoose = require("mongoose");

var campaignSchema = new mongoose.Schema({
	title: String,
	start_time: Date,
	end_time: Date,
	description: String,
	reward: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Reward"
			}
		}
});

module.exports = mongoose.model("Campaign", campaignSchema);