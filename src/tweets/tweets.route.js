const router = require("express").Router();

const tweetController = require("./tweets.controller");
const authMiddleware = require("../auth/auth.middleware");

router.post("/create", authMiddleware, tweetController.createTweetController);
router.get("/", authMiddleware, tweetController.findAllTweetsController);
router.get("/search", authMiddleware, tweetController.searchTweetController);
router.patch("/:id/like", authMiddleware, tweetController.likeTweetController);
router.patch(
  "/:id/retweet",
  authMiddleware,
  tweetController.retweetTweetController
);
router.patch(
  "/:id/comment",
  authMiddleware,
  tweetController.commentTweetController
);

module.exports = router;
