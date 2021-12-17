const { setDoc, doc, getFirestore, getDoc } = require("firebase/firestore");
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
      };
    });

    return res.status(200).json({
      message: "Notifications Fetched",
      data: modifiedNotifications,
    });
  }
  return res.status(404).json({
    message: "No Notifications Found",
  });
};
