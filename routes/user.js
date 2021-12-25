const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
  isUserPresent,
  createUserAccount,
  userNotPresent,
} = require("../controllers/user");

router.post(
  "/isUserPresent/:userId",
  isSignedIn,
  isAuthenticated,
  isUserPresent,
  userNotPresent
);

router.post(
  "/createUserAccount/:userId",
  isSignedIn,
  isAuthenticated,
  isUserPresent,
  createUserAccount
);

module.exports = router;
