var mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
	id: Number,
	stamps: 
		[{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Stamp"
			}
		}],
	owner: 
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
	stamps_needed: Number,
	redeemed: Boolean,
	redeem_time: Date
});

module.exports = mongoose.model("Card", cardSchema);