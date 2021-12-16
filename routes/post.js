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
} = require("../controllers/post-creater/post");

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
router.post("/createImagePost", createSlidePost);

module.exports = router;
