const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const router = express.Router();

router.get("/getAllNotifications", isSignedIn, isAuthenticated, (req, res) => {
  res.json({
    message: "Get All Notification Route implemented",
  });
});

module.exports = router;
