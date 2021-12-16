const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { createTextPost, createVideoPost, createDocumentPost } = require("../controllers/post-creater/post");

router.post("/createTextPost", isSignedIn, isAuthenticated, createTextPost);
router.post("/createVideoPost", isSignedIn, isAuthenticated, createVideoPost);
router.post("/createDocumentPost", isSignedIn, isAuthenticated, createDocumentPost);

module.exports = router;