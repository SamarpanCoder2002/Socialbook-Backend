const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { connectionRequest, acceptRequest } = require("../controllers/connection");
const router = express.Router();

router.post("/connect-request", isSignedIn, isAuthenticated, connectionRequest);
router.post("/accept-request", isSignedIn, isAuthenticated, acceptRequest);

module.exports = router;