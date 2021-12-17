const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getAllNotifications } = require("../controllers/notification");
const router = express.Router();

router.get("/getAllNotifications", isSignedIn, isAuthenticated, getAllNotifications);

module.exports = router;
