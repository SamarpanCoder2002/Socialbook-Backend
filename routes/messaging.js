const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
  getChatBoxId,
  getAllChatMessages,
  addMessageToChatBox,
  getAllChatConnections,
  getPendingChatMessages,
  removePendingMessage,
  addPendingChatMessagesWithController,
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
  "/messaging/getAllChatConnections/:userId",
  isSignedIn,
  isAuthenticated,
  getAllChatConnections
);

// router.get(
//   "/messaging/getPaginatedChatMessages/:userId/:pageId/:chatBoxId",
//   isSignedIn,
//   isAuthenticated,
//   getAllChatMessages
// );

router.get(
  "/messaging/getAllChatMessages/:userId/:chatBoxId",
  isSignedIn,
  isAuthenticated,
  getAllChatMessages
);

router.post(
  "/messaging/addPendingChatMessages/:userId",
  isSignedIn,
  isAuthenticated,
  addPendingChatMessagesWithController
);

router.get(
  "/messaging/getPendingChatMessages/:userId",
  isSignedIn,
  isAuthenticated,
  getPendingChatMessages
);

router.delete(
  "/messaging/deletePendingMessage/:userId/:chatBoxId",
  isSignedIn,
  isAuthenticated,
  removePendingMessage
);

module.exports = router;
