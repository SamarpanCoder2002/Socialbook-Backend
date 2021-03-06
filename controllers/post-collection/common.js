const { Post, User, AccountThings, ConnectionType } = require("../types/types");
const {
  getDoc,
  doc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  getFirestore,
} = require("firebase/firestore");

// ** Add Post to Post Collection **
exports.createAndStorePost = async (db, formattedPostData) => {
  const postDocRef = await addDoc(
    collection(db, Post.postsCollection),
    formattedPostData
  );

  await setDoc(
    doc(db, Post.postsCollection, postDocRef.id, Post.engagement, Post.likes),
    {}
  );
  await setDoc(
    doc(
      db,
      Post.postsCollection,
      postDocRef.id,
      Post.engagement,
      Post.comments
    ),
    {}
  );

  const postDataRef = {
    [Date.now()]: postDocRef.id,
  };

  return [postDocRef, postDataRef];
};

// ** Adding Post to current account my-post section **
exports.addPostRefUnderCurrentAccount = async (db, uid, postDataRef) => {
  await setDoc(
    doc(
      db,
      User.usersCollection,
      uid,
      AccountThings.posts,
      AccountThings.postsCollection
    ),
    postDataRef,
    { merge: true }
  );
};

// ** Collecting Connected Users Id **
exports.collectingConnectedUsersId = async (db, uid) => {
  let connectedUserData = [];

  const docsCollection = await getDoc(
    doc(
      db,
      User.usersCollection,
      uid,
      AccountThings.connections,
      AccountThings.connectionsList
    )
  );

  if (docsCollection.exists()) {
    const data = docsCollection.data();

    connectedUserData = Object.entries(data).filter(
      ([_, connectionType]) => connectionType === ConnectionType.connected
    );
  }

  return connectedUserData;
};

// ** Adding Post Id to Connected Users and Own Account Feed Section **
exports.addingPostIdConnectedUsersAndOwnAcc = async (
  db,
  connectedUserData,
  postDataRef
) => {
  for (let i = 0; i < connectedUserData.length; i++) {
    await setDoc(
      doc(
        db,
        User.usersCollection,
        connectedUserData[i][0],
        AccountThings.feed,
        AccountThings.postsCollection
      ),
      postDataRef,
      { merge: true }
    );
  }
};

exports.updatePollInformation = async (req, res) => {
  const { newPollData, postId } = req.body;

  updateDoc(doc(getFirestore(), Post.postsCollection, postId), newPollData, {
    merge: true,
  })
    .then(() => {
      return res.json({
        code: 200,
        message: "Poll Updated Successfully",
      });
    })
    .catch((err) => {
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};
