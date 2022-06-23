const Tweet = require("./Tweet");

const createTweetService = (message, userId) => {
  return Tweet.create({ message, user: userId });
};

module.exports = { createTweetService };
