const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const todoSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model("Todo", todoSchema);
