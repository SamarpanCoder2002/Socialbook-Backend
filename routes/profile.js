const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { updateProfileData, profileDataCollection } = require("../controllers/profile");

router.put("/updateProfile/:userId", isSignedIn, isAuthenticated, updateProfileData);
router.get("/getProfileData/:userId/:targetProfileId", isSignedIn, isAuthenticated, profileDataCollection);

/// TODO: Come back here to fetch Activity and Post Information of the user

module.exports = router;
