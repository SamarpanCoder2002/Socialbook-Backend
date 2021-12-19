const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
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
  getCurrentAccountPosts,
} = require("../controllers/post-collection/get-posts");

router.post("/createTextPost", isSignedIn, isAuthenticated, createTextPost);
router.post("/createVideoPost", isSignedIn, isAuthenticated, createVideoPost);
router.post(
  "/createDocumentPost",
  isSignedIn,
  isAuthenticated,
  createDocumentPost
);
router.post("/createPollPost", isSignedIn, isAuthenticated, createPollPost);

// TODO: Come back here... not completed.. Do it when connect to frontend
router.post("/createImagePost", createImagePost);
router.post("/createSlidePost", createSlidePost);

// ** For Get Feed and Own Posts **
router.get("/getFeedPosts", isSignedIn, isAuthenticated, getFeedPosts);
router.get("/getMyPosts", isSignedIn, isAuthenticated, getCurrentAccountPosts);

// ** For Engagement Inclusion **
router.post("/postInsertLove/:postId", isSignedIn, isAuthenticated, insertLove);
router.post(
  "/postInsertComment/:postId",
  isSignedIn,
  isAuthenticated,
  insertComment
);

module.exports = router;
