const {
  setDoc,
  doc,
  getFirestore,
  getDoc,
  updateDoc,
  deleteField,
  onSnapshot,
  collection,
  query,
} = require("firebase/firestore");
const { User, AccountThings } = require("./types/types");

exports.addNotification = async (
  message,
  navigateEndPoint,
  uid,
  additionalInformation = {}
) => {
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

exports.getAllNotifications = async (req, res) => {
  const db = getFirestore();

  const userNotifications = await getDoc(
    doc(
      db,
      User.usersCollection,
      req.auth.id,
      AccountThings.notification,
      AccountThings.notificationList
    )
  );

  if (userNotifications.data()) {
    const take = userNotifications.data();
    const allNotifications = Object.keys(take).map((key) => [
      Number(key),
      take[key],
    ]);
    allNotifications.sort((a, b) => b[0] - a[0]);

    const modifiedNotifications = allNotifications.map((notification) => {
      return {
        ...notification[1],
        id: notification[0],
      };
    });

    return res.json({
      code: 200,
      message: "Notifications Fetched",
      data: modifiedNotifications,
    });
  }
  return res.json({
    code: 404,
    message: "No Notifications Found",
  });
};

exports.deleteParticularNotification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;

    const db = getFirestore();

    const docRef = doc(
      db,
      User.usersCollection,
      req.auth.id,
      AccountThings.notification,
      AccountThings.notificationList
    );

    await updateDoc(docRef, { [Number(notificationId)]: deleteField() });

    return res.json({
      code: 200,
      message: "Notification Deleted",
    });
  } catch (err) {
    console.log("Error in deleting notification", err);

    return res.json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

exports.getRealTimeNotifications = async (userId, io, socketRefData) => {
  const db = getFirestore();

  const queryData = query(
    collection(db, User.usersCollection, userId, AccountThings.notification)
  );

  const socketId = socketRefData[0].socketId;

  const unsubscribe = onSnapshot(queryData, (snapshot) => {
    let totalNewNotification = 0;

    snapshot.docChanges().forEach((change) => {
      console.log("change: ", change.type);
      if (change.type === "modified") totalNewNotification++;
    });

    io.to(socketId).emit("totalUpdatedNotification", totalNewNotification);
  });

  return unsubscribe;
};
