const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { connectionRequest, acceptRequest,  getSpecificConnections, getAllAvailableUsers, removeConnectedUsers, withDrawSentRequest } = require("../controllers/connection");

router.post("/connect-request", isSignedIn, isAuthenticated, connectionRequest);
router.post("/accept-request", isSignedIn, isAuthenticated, acceptRequest);
router.get("/getConnections/:requiredConnectionType", isSignedIn, isAuthenticated, getSpecificConnections);
router.get("/getAllAvailableUsers", isSignedIn, isAuthenticated, getAllAvailableUsers);
router.post("/removeConnections", isSignedIn, isAuthenticated, removeConnectedUsers);
router.post("/withDrawSentRequest", isSignedIn, isAuthenticated, withDrawSentRequest);

module.exports = router;