const { getAuth } = require("firebase/auth");
const { User, AccountThings, Post, PostTypes } = require("./types/types");
const {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
} = require("firebase/firestore");
const { addNotification } = require("./notification");
const { uploadFileInStorage } = require("./post-collection/upload-in-storage");
const formidable = require("formidable");
const fs = require("fs");

exports.userNotPresent = (req, res) => {
  return res.json({
    message: "User Not Present",
  });
};

/// Middleware
exports.isUserPresent = (req, res, next) => {
  try {
    const db = getFirestore();

    getDoc(doc(db, User.usersCollection, req.auth.id))
      .then((snapShot) => {
        if (!snapShot.data()) {
          next();
        } else {
          const { name, description, profilePic } = snapShot.data();
          res.json({
            code: 200,
            message: "User already present",
            isUserPresent: true,
            name,
            description,
            profilePic,
          });
        }
      })
      .catch((err) => {
        console.log(
          "Error: User controller user present email error is: ",
          err
        );
        res.json({
          code: 500,
          message: "Internal Server Error",
        });
      });
  } catch (err) {
    res.clearCookie(process.env.AUTH_TOKEN);

    return res.json({
      code: 403,
      message: "Session Expired. Please Sign In Again",
    });
  }
};

exports.createUserAccount = async (req, res) => {
  try {
    const auth = getAuth();

    if (!auth.currentUser) {
      return res.json({
        code: 403,
        message: "Session Expired. Please Sign In Again",
      });
    }

    if (!getAuth()) {
      return res.json({
        code: 403,
        message: "Session Expired. Please Sign In Again",
      });
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
      if (err) {
        return res.json({
          error: "Problem with Image",
        });
      }

      const picFile = file.file;

      if (!picFile) {
        return setProfileDataInDatabase(req, res, {
          ...fields,
        });
      } else {
        if (picFile.size > 3000000) {
          return res.json({
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
    return res.json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

const setProfileDataInDatabase = async (req, res, formExtractedData) => {
  const { user, description, profilePicLink } = formExtractedData;

  const auth = getAuth();
  const db = getFirestore();

  await setDoc(doc(db, User.usersCollection, req.auth.id), {
    email: auth.currentUser.email.toString(),
    name: user,
    profilePic: profilePicLink || "",
    description: description,
  });

  addNotification("😍 Your Account Created Successfully", `/feed`, req.auth.id);

  await getSuggestedPosts(db, req.auth.id);

  return res.json({
    code: 200,
    message: "User Account Created Successfully",
  });
};

const getSuggestedPosts = async (db, uid) => {
  const querySnapShot = await getDocs(
    query(collection(db, Post.postsCollection))
  ).catch((err) => {
    console.log("Error is: ", err);
  });

  if (querySnapShot.docs?.length === 0) return;

  let tempData = [];
  const postCollectionData = {};

  querySnapShot.docs.forEach((doc) => {
    tempData.push(doc.id);
  });
  tempData = tempData.length <= 14 ? tempData : randomElements(tempData, 14);

  for (let i = 0; i < tempData.length; i++) {
    postCollectionData[Date.now() + i] = tempData[i];
  }

  setDoc(
    doc(
      db,
      User.usersCollection,
      uid,
      AccountThings.feed,
      AccountThings.feedCollection
    ),
    postCollectionData,
    { merge: true }
  );
};

const randomElements = (docsData, totalElements) => {
  const pickedData = [];

  for (let i = 0; i < totalElements;) {
    const random = Math.floor(Math.random() * docsData.length);
    !pickedData.includes(docsData[random]) && pickedData.push(docsData[random]) && i++;
  }
  return pickedData;
};
