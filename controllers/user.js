const { getAuth } = require("firebase/auth");
const { User } = require("./types/types");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  where,
  query,
} = require("firebase/firestore");
const { addNotification } = require("./notification");

exports.userNotPresent = (req, res) => {
  return res.status(404).json({
    message: "User Not Present",
  });
};

/// Create User Account
exports.createUserAccount = async (req, res) => {
  const auth = getAuth();
  const userRealId = auth.currentUser.uid;

  const db = getFirestore();

  /// NOTE: User Account Created Successfully
  await setDoc(doc(db, User.usersCollection, userRealId), {
    email: `${auth.currentUser.email}`,
    name: req.body.name,
    profilePic: req.body.profilePic,
    description: req.body.description,
    interests: req.body.interests,
  });

  addNotification("😍 Your Account Created Successfully", `/feed`, userRealId);

  return res.status(200).json({
    message: "User Account Created Successfully",
  });
};

/// Middleware
exports.isUserPresent = (req, res, next) => {
  try {
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
                message: "User already present",
              });
            } else {
              next();
            }
          });
        }
      })
      .catch((err) => {
        console.log(
          "Error: User controller user present email error is: ",
          err
        );
        res.status(500).json({
          message: err.message,
        });
      });
  } catch (err) {
    res.clearCookie(process.env.AUTH_TOKEN);

    return res.status(200).json({
      message: "Session Expired. Please Sign In Again",
    });
  }
};
