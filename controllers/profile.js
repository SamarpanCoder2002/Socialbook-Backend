const { getFirestore, getDoc, doc, setDoc } = require("firebase/firestore");
const { addNotification } = require("./notification");
const { User, AccountThings } = require("./types/types");
const formidable = require("formidable");
const fs = require("fs");
const { uploadFileInStorage } = require("./post-collection/upload-in-storage");

exports.updateProfileData = (req, res) => {
  const db = getFirestore();

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  getDoc(doc(db, User.usersCollection, req.auth.id))
    .then((snapShot) => {
      if (!snapShot.data()) {
        return res.status(404).json({
          code: 404,
          message: "User Not Found",
        });
      }

      const { name, description, profilePic } = snapShot.data();
      form.parse(req, async (err, fields, file) => {
        if (err) {
          return res.status(400).json({
            error: "Problem with Image",
          });
        }

        const { updatedName, updatedDescription, updatedProfilePic } = fields;
        const picFile = file.updatedProfilePic;

        if (!picFile) {
          if (
            name !== updatedName ||
            description !== updatedDescription ||
            profilePic !== updatedProfilePic
          ) {
            await setDoc(
              doc(db, User.usersCollection, req.auth.id),
              {
                name: updatedName,
                description: updatedDescription,
                profilePic: updatedProfilePic,
              },
              { merge: true }
            );

            return updatedProfileDataEndMessage(
              updatedName,
              updatedDescription,
              updatedProfilePic,
              req.auth.id,
              res
            );
          }
        } else {
          if (picFile.size > 3000000) {
            return res.status(400).json({
              code: 400,
              message:
                "Profile Picture size too large... Please upload a Picture Within 3MB",
            });
          }

          const uploadedProfilePicLink = await uploadFileInStorage(
            fs.readFileSync(picFile.filepath),
            `${req.auth.id}-profile-pic.jpg`,
            AccountThings.profileImgStorageContainer,
            picFile.mimetype
          );

          await setDoc(
            doc(db, User.usersCollection, req.auth.id),
            {
              name: updatedName,
              description: updatedDescription,
              profilePic: uploadedProfilePicLink,
            },
            { merge: true }
          );

          return updatedProfileDataEndMessage(
            updatedName,
            updatedDescription,
            uploadedProfilePicLink,
            req.auth.id,
            res
          );
        }

        return updatedProfileDataEndMessage(
          updatedName,
          updatedDescription,
          updatedProfilePic,
          req.auth.id,
          res
        );
      });
    })
    .catch((err) => {
      console.log("error in updateProfileData", err);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    });
};

const updatedProfileDataEndMessage = (
  updatedName,
  updatedDescription,
  updatedProfilePic,
  uid,
  res
) => {
  addNotification(
    "Your Profile Updated Successfully 🎉",
    `/${uid}/profile`,
    uid
  );

  return res.status(200).json({
    code: 200,
    message: "Profile Updated Successfully",
    name: updatedName,
    description: updatedDescription,
    profilePic: updatedProfilePic,
  });
};

exports.profileDataCollection = async (req, res) => {
  const response = await this.getProfileData(
    req.auth.id,
    req.params.targetProfileId
  );

  return res.status(response.code).json(response);
};

exports.getProfileData = async (authId, requiredProfileId) => {
  const db = getFirestore();

  const docRef = await getDoc(
    doc(db, User.usersCollection, requiredProfileId)
  ).catch((err) => {
    console.log("error in getProfileData", err);
    return {
      code: 500,
      message: "Internal Server Error",
    };
  });

  if (docRef.data()) {
    const { name, description, profilePic, email } = docRef.data();

    const data = {
      name,
      description,
      profilePic,
    };

    if (authId === requiredProfileId) {
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
