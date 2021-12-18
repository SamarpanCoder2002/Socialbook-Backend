const { getFirestore, getDoc, doc, setDoc } = require("firebase/firestore");
const { addNotification } = require("./notification");
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

        addNotification(
          "Your Profile Updated Successfully 🎉",
          `/${uid}/profile`,
          uid
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

exports.profileDataCollection = async (req, res) => {
  const response = await this.getProfileData(req.auth.id, req.body.targetProfileId);

  return res.status(response.code).json(response);
};

exports.getProfileData = async ( authId, requiredProfileId) => {
  const db = getFirestore();

  const docRef = await getDoc(doc(db, User.usersCollection, requiredProfileId)).catch(
    (err) => {
      console.log("error in getProfileData", err);
      return {
        code: 500,
        message: "Internal Server Error",
      };
    }
  );

  if (docRef.data()) {
    const { name, description, profilePic, interests, email } = docRef.data();

    const data = {
      name,
      description,
      profilePic,
    };

    if (authId === requiredProfileId) {
      data.interests = interests;
      data.email = email;
    }

    return {
      code: 200,
      data: data,
    };
  }

  return {
    code: 404,
    message: "User Not Found",
  };
};
