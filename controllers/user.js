const { getAuth } = require("firebase/auth");
const { User } = require("./types/types");
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

  return res.status(200).json({
    message: "User Account Created Successfully",
  });

  /// TODO: Will Create Automatically at connected place
  // await setDoc(
  //   doc(db, User.usersCollection, userRealId, "connections", "connected"),
  //   {}
  // );

  /// TODO: Will Create Automatically at invitation Received place
  // await setDoc(
  //   doc(
  //     db,
  //     User.usersCollection,
  //     userRealId,
  //     "connections",
  //     "invitation",
  //     "received",
  //     "empty"
  //   ),
  //   {}
  // );

  /// TODO: Will Create Automatically at Connection Request place
  // await setDoc(
  //   doc(
  //     db,
  //     User.usersCollection,
  //     userRealId,
  //     "connections",
  //     "invitation",
  //     "sent",
  //     "empty"
  //   ),
  //   {}
  // );

  /// TODO: Below things will create at correct place respectively
  // await setDoc(
  //   doc(db, User.usersCollection, userRealId, "profile", "ownPost"),
  //   {}
  // );
  // await setDoc(
  //   doc(db, User.usersCollection, userRealId, "profile", "activity"),
  //   {}
  // );

  // await setDoc(
  //   doc(db, User.usersCollection, userRealId, "post-feed", "welcome"),
  //   {}
  // );
  // await setDoc(
  //   doc(
  //     db,
  //     User.usersCollection,
  //     userRealId,
  //     "notification",
  //     "your-account-created"
  //   ),
  //   {}
  // );
  // await setDoc(
  //   doc(db, User.usersCollection, userRealId, "chat-collection", "self-chat"),
  //   {}
  // );
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
