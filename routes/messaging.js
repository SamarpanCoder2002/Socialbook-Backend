const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
  getChatBoxId,
  getAllChatMessages,
  addMessageToChatBox,
} = require("../controllers/messaging/messaging");
const router = express.Router();

router.post(
  "/messaging/getChatBoxId",
  isSignedIn,
  isAuthenticated,
  getChatBoxId
);
router.post(
  "/messaging/addChatBoxMessage",
  isSignedIn,
  isAuthenticated,
  addMessageToChatBox
);
router.get(
  "/messaging/getAllChatMessages",
  isSignedIn,
  isAuthenticated,
  getAllChatMessages
);

module.exports = router;
