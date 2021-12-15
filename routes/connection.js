const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { connectionRequest, acceptRequest,  getSpecificConnections } = require("../controllers/connection");

router.post("/connect-request", isSignedIn, isAuthenticated, connectionRequest);
router.post("/accept-request", isSignedIn, isAuthenticated, acceptRequest);
router.get("/getConnections/:requiredConnectionType", isSignedIn, isAuthenticated, getSpecificConnections);

module.exports = router;