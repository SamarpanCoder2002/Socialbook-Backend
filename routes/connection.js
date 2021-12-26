const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
  connectionRequest,
  acceptRequest,
  getSpecificConnections,
  getAllAvailableUsers,
  removeConnectedUsers,
  withDrawSentRequest,
  removeIncomingConnectionRequest,
} = require("../controllers/connection");

router.post("/sendConnectionRequest/:userId", isSignedIn, isAuthenticated, connectionRequest);
router.post("/acceptConnectionRequest/:userId", isSignedIn, isAuthenticated, acceptRequest);

router.get(
  "/getConnections/:requiredConnectionType/:userId",
  isSignedIn,
  isAuthenticated,
  getSpecificConnections
);

router.get(
  "/getAllAvailableUsers/:userId",
  isSignedIn,
  isAuthenticated,
  getAllAvailableUsers
);

router.post(
  "/removeConnections/:userId",
  isSignedIn,
  isAuthenticated,
  removeConnectedUsers
);

router.post(
  "/withDrawSentRequest/:userId",
  isSignedIn,
  isAuthenticated,
  withDrawSentRequest
);

router.post(
  "/removeIncomingConnectionRequest/:userId",
  isSignedIn,
  isAuthenticated,
  removeIncomingConnectionRequest
);

module.exports = router;
