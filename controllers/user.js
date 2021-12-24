const { getAuth } = require("firebase/auth");
const { User, AccountThings } = require("./types/types");
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
const { uploadFileInStorage } = require("./post-collection/upload-in-storage");
const formidable = require("formidable");
const fs = require("fs");

exports.userNotPresent = (req, res) => {
  return res.status(404).json({
    message: "User Not Present",
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
                code: 200,
                message: "User already present",
                isUserPresent: true,
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
          code: 500,
          message: "Internal Server Error",
        });
      });
  } catch (err) {
    res.clearCookie(process.env.AUTH_TOKEN);

    return res.status(403).json({
      code: 403,
      message: "Session Expired. Please Sign In Again",
    });
  }
};

exports.createUserAccount = async (req, res) => {
  try {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
      if (err) {
        return res.status(400).json({
          error: "Problem with Image",
        });
      }

      const picFile = file.file;

      if (!picFile) {
        const profilePicLink = process.env.NO_PROFILE_IMG;

        return setProfileDataInDatabase(req, res, {
          ...fields,
          profilePicLink,
        });
      } else {
        if (picFile.size > 3000000) {
          return res.status(400).json({
            code: 400,
            message:
              "Profile Picture size too large... Please upload a Picture Within 3MB",
          });
        }

        const profilePicLink = await uploadFileInStorage(
          fs.readFileSync(picFile.filepath),
          `${req.auth.id}-profile-pic.jpg`,
          AccountThings.profileImgStorageContainer,
          picFile.mimetype
        );

        return setProfileDataInDatabase(req, res, {
          ...fields,
          profilePicLink,
        });
      }
    });
  } catch (err) {
    console.log("Error in Create User profile: ", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

const setProfileDataInDatabase = async (req, res, formExtractedData) => {
  const { user, description, profilePicLink, interests } = formExtractedData;

  const auth = getAuth();
  const db = getFirestore();

  await setDoc(doc(db, User.usersCollection, req.auth.id), {
    email: auth.currentUser.email.toString(),
    name: user,
    profilePic: profilePicLink,
    description: description,
    interests: JSON.parse(interests),
  });

  addNotification("😍 Your Account Created Successfully", `/feed`, req.auth.id);

  return res.status(200).json({
    code: 200,
    message: "User Account Created Successfully",
  });
};
