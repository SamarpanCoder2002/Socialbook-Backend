const { getFirestore, getDoc, doc, setDoc } = require("firebase/firestore");
const { User } = require("./types/types");

exports.updateProfileData = (req, res) => {
  const { name, description, profilePic, interests, uid } = req.body;

  const db = getFirestore();

  getDoc(doc(db, User.usersCollection, uid))
    .then(async (docRef) => {
      if (docRef.data()) {
        await setDoc(
          doc(db, User.usersCollection, uid),
          {
            name,
            description,
            profilePic,
            interests,
          },
          { merge: true }
        );
        return res.status(200).json({
          message: "Profile Updated",
        });
      }
      return res.status(404).json({
        message: "User Not Found",
      });
    })
    .catch((err) => {
      console.log("error in updateProfileData", err);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    });
};

exports.getProfileData = (req, res) => {
  const { uid } = req.body;

  const db = getFirestore();

  getDoc(doc(db, User.usersCollection, uid))
    .then(async (docRef) => {
      if (docRef.data()) {
        const { name, description, profilePic, interests, email } = docRef.data();

        const data = {
          name,
          description,
          profilePic,
        };

        if (req.auth.id === uid) {
          data.interests = interests;
          data.email = email;
        }

        return res.status(200).json({
          data: data,
        });
      }
      return res.status(404).json({
        message: "User Not Found",
      });
    })
    .catch((err) => {
      console.log("error in getProfileData", err);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    });
};
