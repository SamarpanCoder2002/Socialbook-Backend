const { validationResult } = require("express-validator");

const {
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserSessionPersistence,
  sendEmailVerification,
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
        const user = userCredential.user;

        if (user.emailVerified) {
          user.getIdToken(true).then((token) => {
            res.cookie(process.env.AUTH_TOKEN, token);

            return res.status(200).json({
              token,
              message: "Sign in successful",
              user: user,
            });
          });
        } else {
          return res.status(422).json({
            error: "Email not verified",
          });
        }
      })
      .catch((error) => {
        return res.status(422).json({
          error:
            error.message === "Firebase: Error (auth/wrong-password)."
              ? "Wrong Password"
              : error.message,
        });
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

exports.isSignedIn = (req, res, next) => {
  const auth = getAuth();

  if (!auth.currentUser) {
    return res.status(401).json({
      code: 401,
      error: "UnAuthorized",
    });
  }

  auth.currentUser
    .getIdToken(true)
    .then((token) => {
      next();
    })
    .catch((error) => {
      return res.status(401).json({
        message: "Sign in Unsuccessful",
      });
    });
};

