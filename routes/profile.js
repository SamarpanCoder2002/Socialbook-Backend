const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { updateProfileData, getProfileData } = require("../controllers/profile");

router.put("/updateProfile", isSignedIn, isAuthenticated, updateProfileData);
router.get("/getProfileData", isSignedIn, getProfileData);

/// TODO: Come back here to fetch Activity and Post Information of the user

module.exports = router;
