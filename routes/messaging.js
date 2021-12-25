const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
  getChatBoxId,
  getAllChatMessages,
  addMessageToChatBox,
} = require("../controllers/messaging/messaging");
const router = express.Router();

router.post(
  "/messaging/getChatBoxId/:userId",
  isSignedIn,
  isAuthenticated,
  getChatBoxId
);
router.post(
  "/messaging/addChatBoxMessage/:userId",
  isSignedIn,
  isAuthenticated,
  addMessageToChatBox
);
router.get(
  "/messaging/getAllChatMessages/:userId",
  isSignedIn,
  isAuthenticated,
  getAllChatMessages
);

module.exports = router;
