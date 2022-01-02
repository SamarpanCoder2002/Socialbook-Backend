const {
  TextPost,
  VideoPost,
  PDFPost,
  PollPost,
  ImagePost,
  SlidePost,
} = require("../../models/post");
const { getFirestore, Firestore } = require("firebase/firestore");
const formidable = require("formidable");
const fs = require("fs");

const {
  createAndStorePost,
  addPostRefUnderCurrentAccount,
  collectingConnectedUsersId,
  addingPostIdConnectedUsersAndOwnAcc,
} = require("./common");
const { addNotification } = require("../notification");
const { uploadFileInStorage } = require("./upload-in-storage");
const { PostTypes } = require("../types/types");

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

exports.createPollPost = async (req, res) => {
  const { text, question, options } = req.body;

  const pollPost = new PollPost(text, question, options);
  const formattedPostData = pollPost.getFormattedData();

  return await addPostToDB(formattedPostData, req.auth.id, res);
};

/// TODO: This is not completed.. Do it when connect to frontend
exports.createImagePost = async (req, res) => {
  try {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(404).json({
          code: 404,
          error: "Problem with Image",
        });
      }

      const uploadedImageFiles = [];
      const currentTime = Date.now();

      for (let imgNum in files) {
        const uploadedFileLink = await uploadFileInStorage(
          fs.readFileSync(files[imgNum].filepath),
          `${currentTime}-image-${imgNum}.jpg`,
          `${req.auth.id}/posts/images`,
          files[imgNum].mimetype
        );
        uploadedImageFiles.push(uploadedFileLink);
      }

      const imgPost = new ImagePost(fields.text || "", uploadedImageFiles);
      const formattedPostData = imgPost.getFormattedData();

      return await addPostToDB(formattedPostData, req.auth.id, res);
    });
  } catch (err) {
    console.log("error in createTextPost", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

/// TODO: This is not completed.. Do it when connect to frontend
exports.createSlidePost = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(404).json({
        code: 404,
        error: "Problem with Image",
      });
    }

    const currentTime = Date.now();
    const postData = {};

    for (let field in fields) {
      if (field !== "text")
        postData[Number(field)] = {
          type: PostTypes.Text,
          data: fields[field],
        };
    }

    for (let imgFile in files) {
      postData[Number(imgFile)] = {
        type: PostTypes.Image,
        data: await uploadFileInStorage(
          fs.readFileSync(files[imgFile].filepath),
          `${currentTime}-slide-img.jpg`,
          `${req.auth.id}/posts/slide/images`,
          files[imgFile].mimetype
        ),
        alt: currentTime,
      };
    }

    const slidePost = new SlidePost(fields.text || "", Object.values(postData));
    const formattedPostData = slidePost.getFormattedData();

    return await addPostToDB(formattedPostData, req.auth.id, res);
  });
};

// ** Handle Post Addition in Database **
const addPostToDB = async (formattedPostData, uid, res) => {
  try {
    formattedPostData.postHolderId = uid;
    const db = getFirestore();

    const [postDocRef, postDataRef] = await createAndStorePost(
      db,
      formattedPostData
    );
    await addPostRefUnderCurrentAccount(db, uid, postDataRef);
    const connectedUserData = await collectingConnectedUsersId(db, uid);

    connectedUserData.push([uid]);

    await addingPostIdConnectedUsersAndOwnAcc(
      db,
      connectedUserData,
      postDataRef
    );

    addNotification(
      "😮 Post Published Successfully",
      `/post/${postDocRef.id}`,
      uid
    );

    return res.status(200).json({
      code: 200,
      message: "Post Created Successfully",
    });
  } catch (err) {
    console.log("error in createTextPost", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};
