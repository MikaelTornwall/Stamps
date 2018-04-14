var mongoose = require("mongoose");

var stampSchema = new mongoose.Schema({
	id: Number,
	card: 
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Card"
			}
		},
	requesting_time: Date,
	granting_time: Date
});

module.exports = mongoose.model("Stamp", stampSchema);