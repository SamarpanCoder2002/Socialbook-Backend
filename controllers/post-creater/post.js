const { TextPost, VideoPost, PDFPost, PollPost } = require("../../models/post");
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

exports.createVideoPost = async (req, res) => {
  const { text, video } = req.body;

  const videoPost = new VideoPost(text, video);
  const formattedPostData = videoPost.getFormattedData();

  return await addPostToDB(formattedPostData, req.auth.id, res);
};

exports.createDocumentPost = async (req, res) => {
  const { text, pdfSrc } = req.body;

  const pdfPost = new PDFPost(text, pdfSrc);
  const formattedPostData = pdfPost.getFormattedData();

  return await addPostToDB(formattedPostData, req.auth.id, res);
};

/// TODO: This is not completed.. Do it when connect to frontend
exports.createImagePost = async (req, res) => {
  console.log(req.body);

  const { text, image } = req.body;

  console.log("Here");
  console.log(image);

  res.json({
    message: "Image Post Created Successfully",
  });
};

exports.createPollPost = async (req, res) => {
  const { text, question, options } = req.body;

  const pollPost = new PollPost(text, question, options);
  const formattedPostData = pollPost.getFormattedData();

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
