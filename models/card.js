var mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
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
				ref: "Customer"
			}
		},
	campaign: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Campaign"
			},
			name: String
		},
	claimed: Boolean,
	claim_time: Date
});

module.exports = mongoose.model("Card", cardSchema);