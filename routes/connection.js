const express = require("express");
const { isSignedIn } = require("../controllers/auth");
const { connectionRequest, acceptRequest } = require("../controllers/connection");
const router = express.Router();

router.post("/connect-request", isSignedIn, connectionRequest);
router.post("/accept-request", isSignedIn, acceptRequest);

module.exports = router;