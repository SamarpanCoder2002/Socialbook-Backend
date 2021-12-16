const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { createTextPost } = require("../controllers/post-creater/post");

router.post("/createTextPost", isSignedIn, isAuthenticated, createTextPost);

module.exports = router;