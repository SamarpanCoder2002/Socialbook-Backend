const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signup, signin, signout, isSignedIn, isAuthenticated, googleSignInWithProvider } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Email is Required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("Email is Required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  signin
);

router.post("/googleSignIn", googleSignInWithProvider);

router.post("/signout", isSignedIn, isAuthenticated, signout);

module.exports = router;
