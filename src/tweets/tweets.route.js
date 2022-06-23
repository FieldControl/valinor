const router = require("express").Router();

const tweetController = require("./tweets.controller");
const authMiddleware = require("../auth/auth.middleware");

router.post("/", authMiddleware, tweetController.createTweetController);

module.exports = router;