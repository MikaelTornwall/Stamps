var mongoose = require("mongoose");

var stampSchema = new mongoose.Schema({
	id: Number,
	company: String,
	holder: String,
	campaign: String,
	requesting_time: Date,
	granting_time: Date,
	identifier: String
});

module.exports = mongoose.model("Stamp", stampSchema);