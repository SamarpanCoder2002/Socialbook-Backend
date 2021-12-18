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
exports.getFeedData = async (req, res) => {
  const db = getFirestore();

  let page = req.query.page ?? 1;

  if (page !== 0) {
    page = Number(page);
    if (page < 1) page = 1;
  }

  const collectedPostRef = await getPaginatedPostRefLimit(
    db,
    page,
    req.auth.id
  );

  const actualModifiedPostData = await getAllFeedPostDataInformation(
    collectedPostRef
  );

  res.json({
    message: "Feed Data",
    data: actualModifiedPostData,
  });
};

exports.getMyOwnPosts = async (req, res) => {
  const db = getFirestore();

  let page = req.query.page ?? 0;

  if (page !== 0) {
    page = Number(page);
    if (page < 0) page = 0;
    else page--;
  }

  const collectedPostRef = await getPaginatedPostRefLimit(
    db,
    page * 5,
    req.auth.id
  );

  const actualModifiedPostData = await getAllFeedPostDataInformation(
    collectedPostRef
  );

  res.json({
    message: "Feed Data",
    data: actualModifiedPostData,
  });
};

// ** Limit Post Ref for infinite scroll/pagination **
const getPaginatedPostRefLimit = async (db, page, uid) => {
  const docRef = await getDoc(
    doc(
      db,
      User.usersCollection,
      uid,
      AccountThings.feed,
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
const getAllFeedPostDataInformation = async (collectedPostRef) => {
  const actualModifiedPostData = [];
  const userDataSet = {};

  for (let i = 0; i < collectedPostRef.length; i++) {
    const postData = await getPostData(collectedPostRef[i]);
    if (postData) {
      userDataSet[postData.postHolderId]
        ? (postData.postHolderData = userDataSet[postData.postHolderId])
        : await postHolderDataInclusion(postData, userDataSet);

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

// ** Post Engagament Size Inclusion **
const engagementInclusion = async (db, postDataModified, postRef) => {
  postDataModified.engagement = {};

  const engagementSnapShot = await getDocs(
    query(collection(db, Post.postsCollection, postRef, Post.engagement))
  );

  const engagement = engagementSnapShot.docs;

  for (let i = 0; i < engagement.length; i++) {
    if (engagement[i].data() && Object.keys(engagement[i].data()).length > 0) {
      const data = engagement[i].data();
      const allRef = Object.keys(data).map((key) => data[key]);

      postDataModified[Post.engagement][engagement[i].id] = allRef.reverse();
    } else {
      postDataModified[Post.engagement][engagement[i].id] = [];
    }
  }
  return postDataModified;
};
