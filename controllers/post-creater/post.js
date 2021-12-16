const { TextPost } = require("../../models/post");
const { getFirestore } = require("firebase/firestore");

const {
  createAndStorePost,
  addPostRefUnderCurrentAccount,
  collectingConnectedUsersId,
  addingPostIdConnectedUsersAndOwnAcc,
} = require("./common");

exports.createTextPost = async (req, res) => {
  const { text } = req.body;

  const textPost = new TextPost(text);
  const formattedPostData = textPost.getFormattedData();

  return await addPostToDB(formattedPostData, req.auth.id, res);
};

// ** Handle Post Addition in Database **
const addPostToDB = async (formattedPostData, uid, res) => {
  try {
    const db = getFirestore();

    const postDataRef = await createAndStorePost(db, formattedPostData);
    await addPostRefUnderCurrentAccount(db, uid, postDataRef);
    const connectedUserData = await collectingConnectedUsersId(db, uid);

    connectedUserData.push([uid]);

    await addingPostIdConnectedUsersAndOwnAcc(
      db,
      connectedUserData,
      postDataRef
    );

    return res.status(200).json({
      message: "Post Created Successfully",
    });
  } catch (err) {
    console.log("error in createTextPost", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
