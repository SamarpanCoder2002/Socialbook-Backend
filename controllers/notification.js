const { setDoc, doc, getFirestore } = require("firebase/firestore");
const { User, AccountThings } = require("./types/types");

exports.addNotification = async ( message, navigateEndPoint, uid, additionalInformation={} ) => {
  const newNotification = {
    [Date.now()]: {
      message: message,
      navigateTo: navigateEndPoint,
      additionalInformation: additionalInformation,
    },
  };

  const db = getFirestore();

  await setDoc(
    doc(
      db,
      User.usersCollection,
      uid,
      AccountThings.notification,
      AccountThings.notificationList
    ),
    newNotification,
    { merge: true }
  );
};