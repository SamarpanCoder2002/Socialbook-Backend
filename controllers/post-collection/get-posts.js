const {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
  query,
} = require("firebase/firestore");
const { getProfileData } = require("../profile");
const { User, AccountThings, Post } = require("../types/types");

// ** Feed Data Fetching Controller **
exports.getFeedPosts = async (req, res) =>
  await getPosts(req.query.page ?? 1, true, res, req.auth.id);

// ** Current Account Created Post Fetching Controller **
exports.getParticularAccountPosts = async (req, res) =>
  await getPosts(req.query.page ?? 1, false, res, req.params.userId);

// ** Manage to take all posts **
const getPosts = async (page, feed, res, authId) => {
  const db = getFirestore();

  if (page !== 1) {
    page = Number(page);
    if (page < 1) page = 1;
  }

  const collectedPostRef = await getPaginatedPostRefLimit(
    db,
    page,
    authId,
    feed ? AccountThings.feed : AccountThings.posts
  );

  if (collectedPostRef && collectedPostRef.length > 0) {
    const actualModifiedPostData = await getAllFeedPostDataInformation(
      collectedPostRef,
      feed
    );

    return res.status(200).json({
      code: 200,
      message: "Feed Data",
      data: actualModifiedPostData,
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: "Feed Data",
      data: [],
    });
  }
};

// ** Limit Post Ref for infinite scroll/pagination **
const getPaginatedPostRefLimit = async (db, page, uid, subCollection) => {
  const docRef = await getDoc(
    doc(
      db,
      User.usersCollection,
      uid,
      subCollection,
      AccountThings.feedCollection
    )
  ).catch((err) => {});

  if (docRef.exists()) {
    const data = docRef.data();
    const allPostRef = Object.keys(data).map((key) => [Number(key), data[key]]);
    allPostRef.sort((a, b) => b[0] - a[0]);

    const modifiedPostRef = allPostRef.map(
      (postRefContainer) => postRefContainer[1]
    );

    // ** First Page only take two posts and after that take 4 posts **
    if (page === 1) return modifiedPostRef.slice(0, 2);
    page = ((page - 2) * 2 + 1) * 2;
    return modifiedPostRef.slice(page, page + 4);
  }
};

// ** Get All Feed Post Data Information **
const getAllFeedPostDataInformation = async (
  collectedPostRef,
  postHolderDataRequired
) => {
  const actualModifiedPostData = [];
  const userDataSet = {};

  for (let i = 0; i < collectedPostRef.length; i++) {
    const postData = await getPostData(collectedPostRef[i]);
    if (postData) {
      if (postHolderDataRequired) {
        userDataSet[postData.postHolderId]
          ? (postData.postHolderData = userDataSet[postData.postHolderId])
          : await postHolderDataInclusion(postData, userDataSet);
      }

      actualModifiedPostData.push(postData);
    }
  }

  return actualModifiedPostData;
};

// ** Post Holder Data Inclusion **
const postHolderDataInclusion = async (postData, userDataSet) => {
  const response = await getProfileData(undefined, postData.postHolderId);

  if (response.code !== 200) postData.postHolderData = {};
  else {
    postData.postHolderData = response.data;
    userDataSet[postData.postHolderId] = response.data;
  }
};

// ** Post Data Fetching from Post Container **
const getPostData = async (postRef) => {
  const db = getFirestore();

  const postData = await getDoc(doc(db, Post.postsCollection, postRef)).catch(
    (err) => {
      console.log("Error in getPostData: ", err);
    }
  );

  if (postData.data()) {
    const postDataModified = postData.data();
    postDataModified.postId = postRef;
    return await engagementInclusion(db, postDataModified, postRef);
  }
};

// ** Post Engagament Inclusion **
const engagementInclusion = async (db, postDataModified, postRef) => {
  postDataModified.engagement = {};

  const engagementSnapShot = await getDocs(
    query(collection(db, Post.postsCollection, postRef, Post.engagement))
  );

  const engagement = engagementSnapShot.docs;

  for (let i = 0; i < engagement.length; i++) {
    if (engagement[i].data() && Object.keys(engagement[i].data()).length > 0) {
      const data = engagement[i].data();
      const allRef = Object.keys(data).map((key) =>
        engagement[i].id === "likes" ? key : data[key]
      );

      postDataModified[Post.engagement][engagement[i].id] = allRef.reverse();
    } else {
      postDataModified[Post.engagement][engagement[i].id] = [];
    }
  }
  return postDataModified;
};
