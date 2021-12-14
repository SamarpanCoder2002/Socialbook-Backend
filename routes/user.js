const express = require("express");
const router = express.Router();
const { isSignedIn } = require("../controllers/auth");
const {
  isUserPresent,
  createUserAccount,
  userNotPresent,
} = require("../controllers/user");

router.get("/isUserPresent", isSignedIn, isUserPresent, userNotPresent);

router.post("/createUserAccount", isSignedIn, isUserPresent, createUserAccount);

module.exports = router;