const express = require("express");
const router = express.Router();
const { isSignedIn } = require("../controllers/auth");
const { isUserPresent, createUserAccount } = require("../controllers/user");

router.get("/isUserPresent", isSignedIn, isUserPresent, createUserAccount);

module.exports = router;
