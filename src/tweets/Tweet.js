const mongoose = require("mongoose");

const TweetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
	ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  likes: {
    type: Array,
    required: true,
  },
  comments: {
    type: Array,
    required: true,
  },
  retweets: {
    type: Array,
    required: true,
  },
});

const Tweet = mongoose.model("Tweet", TweetSchema);

module.exports = Tweet;