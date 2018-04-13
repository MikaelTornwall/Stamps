var mongoose = require("mongoose");

var rewardSchema = new mongoose.Schema({
	title: String,
	image: String,
	description: String,
	company: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Company"
			}
		}
});

module.exports = mongoose.model("Reward", rewardSchema);