const mongoose = require('mongoose');

const GameSchema = mongoose.Schema({
	title: String,
	description: String,
	score: Number,
	company: String
}, {
	timestamps: true
});

module.exports = mongoose.model('Games', GameSchema);
