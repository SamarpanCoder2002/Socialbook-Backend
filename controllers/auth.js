const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

const {
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserSessionPersistence,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithCustomToken,
  signInWithRedirect,
} = require("firebase/auth");

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: `Error in ${errors.array()[0].param}`,
    });
  }

  const { email, password } = req.body;
  const auth = getAuth();

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      sendEmailVerification(user).then(() => {
        return res.status(200).json({
          message: "Sign up successful",
        });
      });
    })
    .catch((error) => {
      return res.status(422).json({
        error:
          error.message === "Firebase: Error (auth/email-already-in-use)."
            ? "Email Already in use"
            : error.message,
      });
    });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: `Error in ${errors.array()[0].param}`,
    });
  }

  const { email, password } = req.body;
  const auth = getAuth();

  setPersistence(auth, browserSessionPersistence).then(() => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);

        const user = userCredential.user;
        if (user.emailVerified) {
          /// Create Token
          const token = jwt.sign({ id: user.uid }, process.env.SECRET);

          res.cookie(process.env.AUTH_TOKEN, token, {
            expire: new Date() + 9999,
          });

          return res.status(200).json({
            token,
            message: "Sign in successful",
            user: user.uid,
          });
        } else {
          return res.status(422).json({
            error: "Email not verified",
          });
        }
      })
      .catch((error) => {
        let errorMessage = error.message;

        if (error.message === "Firebase: Error (auth/wrong-password).")
          errorMessage = "Wrong Password";
        else if (error.message === "Firebase: Error (auth/user-not-found).")
          errorMessage = "User not found";
        else if (error.message === "Firebase: Error (auth/invalid-email).")
          errorMessage = "Invalid Email";
        else if (error.message === "Firebase: Error (auth/wrong-password).")
          errorMessage = "Wrong Password";

        return res.status(404).json({
          error: errorMessage,
        });
      });
  });
};

exports.googleSignInWithProvider = (req, res) => {
  const auth = getAuth();

  signInWithCredential(
    auth,
    GoogleAuthProvider.credential(req.body.idToken, req.body.accessToken)
  )
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        const token = jwt.sign({ id: user.uid }, process.env.SECRET);

        res.cookie(process.env.AUTH_TOKEN, token, {
          expire: new Date() + 9999,
        });

        return res.status(200).json({
          token,
          message: "Sign in successful",
          user: user.uid,
        });
      } else {
        return res.status(422).json({
          error: "Email not verified",
        });
      }
    })
    .catch((error) => {
      console.log("error in google sign in", error);
      res.status(500).json({
        code: 500,
        error: "Internal Server Error",
      });
    });
};

exports.signout = (req, res) => {
  res.clearCookie(process.env.AUTH_TOKEN);
  const auth = getAuth();

  auth
    .signOut()
    .then(() => {
      return res.status(200).json({
        message: "Signout successful",
      });
    })
    .catch((error) => {
      return res.status(422).json({
        error: error.message,
      });
    });
};

exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
  if (req.body && req.auth && req.body.uid === req.auth.id) {
    next();
  } else {
    return res.status(401).json({
      error: "User not Authenticated",
    });
  }
};
