const { getAuth } = require("firebase/auth");
const { User } = require("./types/auth-prototype");
const {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  where,
  query,
} = require("firebase/firestore");

/// Create User Account
exports.createUserAccount = (req, res) => {
  const auth = getAuth();
  const userRealId = auth.currentUser.uid;
  const saltRounds = 10;

  return res.json({
    userRealId,
  });
};

/// Middleware
exports.isUserPresent = (req, res, next) => {
  const db = getFirestore();

  const auth = getAuth();

  const emailSearchQuery = query(
    collection(db, `${User.usersCollection}`),
    where("email", "==", `${auth.currentUser.email}`)
  );

  getDocs(emailSearchQuery)
    .then((querySnapShot) => {
      if (querySnapShot.docs.length === 0) {
        next();
      } else {
        querySnapShot.docs.forEach((doc) => {
          if (doc.exists) {
            res.status(200).json({
              message: "User is present",
            });
          } else {
            next();
          }
        });
      }
    })
    .catch((err) => {
      console.log("Error: User controller user present email error is: ", err);
      res.status(500).json({
        message: err.message,
      });
    });
};
