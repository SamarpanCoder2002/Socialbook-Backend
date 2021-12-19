const { setDoc, doc, getFirestore } = require("firebase/firestore");
const { Post } = require("../types/types");

exports.insertLove = async (req, res) => {
  return await engagementInclusion(
    req.params.postId,
    Post.likes,
    docData(Post.likes, req.auth.id),
    res
  );
};

exports.insertComment = async (req, res) => {
  return await engagementInclusion(
    req.params.postId,
    Post.comments,
    docData(Post.comments, req.auth.id, req.body.comment),
    res
  );
};

const engagementInclusion = async (postId, engagementDocId, newData, res) => {
  try {
    const db = getFirestore();

    await setDoc(
      doc(db, Post.postsCollection, postId, Post.engagement, engagementDocId),
      newData,
      { merge: true }
    );

    res.status(200).json({
      message: "Operation Done",
    });
  } catch (err) {
    console.log("error in engagementInclusion", err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const docData = (type, uid, comment = "") => {
  if (type === Post.likes) {
    return {
      [uid]: Date.now(),
    };
  } else {
    return {
      [Date.now()]: {
        uid: uid,
        comment: comment,
      },
    };
  }
};
