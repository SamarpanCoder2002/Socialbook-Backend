const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
  updatePollInformation,
} = require("../controllers/post-collection/common");
const {
  createTextPost,
  createVideoPost,
  createDocumentPost,
  createImagePost,
  createPollPost,
  createSlidePost,
} = require("../controllers/post-collection/create-post");
const {
  insertLove,
  insertComment,
} = require("../controllers/post-collection/engagement-inclusion");
const {
  getFeedPosts,
  getParticularAccountPosts,
  getParticularPost,
} = require("../controllers/post-collection/get-posts");

router.post(
  "/createTextPost/:userId",
  isSignedIn,
  isAuthenticated,
  createTextPost
);
router.post(
  "/createVideoPost/:userId",
  isSignedIn,
  isAuthenticated,
  createVideoPost
);
router.post(
  "/createDocumentPost/:userId",
  isSignedIn,
  isAuthenticated,
  createDocumentPost
);
router.post(
  "/createPollPost/:userId",
  isSignedIn,
  isAuthenticated,
  createPollPost
);
router.post(
  "/createImagePost/:userId",
  isSignedIn,
  isAuthenticated,
  createImagePost
);
router.post(
  "/createSlidePost/:userId",
  isSignedIn,
  isAuthenticated,
  createSlidePost
);

// ** For Get Feed and Own Posts **
router.get("/getFeedPosts/:userId", isSignedIn, isAuthenticated, getFeedPosts);
router.get(
  "/getParticularAccountPosts/:userId",
  isSignedIn,
  getParticularAccountPosts
);
router.get(
  "/getParticularPost/:userId/:postId",
  isSignedIn,
  isAuthenticated,
  getParticularPost
);

// ** For Engagement Inclusion **
router.post(
  "/postInsertLove/:postId/:userId",
  isSignedIn,
  isAuthenticated,
  insertLove
);
router.post(
  "/postInsertComment/:postId/:userId",
  isSignedIn,
  isAuthenticated,
  insertComment
);

router.post(
  "/updatePollInformation/:userId",
  isSignedIn,
  isAuthenticated,
  updatePollInformation
);

module.exports = router;
