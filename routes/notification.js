const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getAllNotifications, deleteParticularNotification } = require("../controllers/notification");
const router = express.Router();

router.get("/getAllNotifications/:userId", isSignedIn, isAuthenticated, getAllNotifications);
router.delete("/deleteNotification/:userId/:notificationId", isSignedIn, isAuthenticated, deleteParticularNotification);

module.exports = router;
