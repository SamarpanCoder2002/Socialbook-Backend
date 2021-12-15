const {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  where,
  query,
  deleteDoc,
} = require("firebase/firestore");
const { User } = require("./types/auth-prototype");

exports.connectionRequest = async (req, res) => {
  const currentUser = req.body.currentUser;
  const oppositeUser = req.body.oppositeUser;

  const db = getFirestore();

  /// Adding under sent request section
  await setDoc(
    doc(
      db,
      User.usersCollection,
      currentUser.id,
      "connections",
      "invitation",
      "sent",
      oppositeUser.id
    ),
    {
      name: oppositeUser.name,
      description: oppositeUser.description,
      profilePic: oppositeUser.profilePic,
    }
  );

  /// Adding under receive request section
  await setDoc(
    doc(
      db,
      User.usersCollection,
      oppositeUser.id,
      "connections",
      "invitation",
      "received",
      currentUser.id
    ),
    {
      name: currentUser.name,
      description: currentUser.description,
      profilePic: currentUser.profilePic,
    }
  );

  return res.status(200).json({
    message: "Connection Request Sent",
  });
};

exports.acceptRequest = async (req, res) => {
  try {
    const acceptHolder = req.body.acceptHolder;
    const requestHolder = req.body.requestHolder;

    const db = getFirestore();

    await deleteDoc(
      doc(
        db,
        User.usersCollection,
        acceptHolder.id,
        "connections",
        "invitation",
        "received",
        requestHolder.id
      )
    );

    await setDoc(
      doc(
        db,
        User.usersCollection,
        acceptHolder.id,
        "connections",
        "connected"
      ),
      {
        [requestHolder.id]: {
          name: requestHolder.name,
          description: requestHolder.description,
          profilePic: requestHolder.profilePic,
        },
      },
      { merge: true }
    );

    await deleteDoc(
      doc(
        db,
        User.usersCollection,
        requestHolder.id,
        "connections",
        "invitation",
        "sent",
        acceptHolder.id
      )
    );

    await setDoc(
      doc(
        db,
        User.usersCollection,
        requestHolder.id,
        "connections",
        "connected"
      ),
      {
        [acceptHolder.id]: {
          name: acceptHolder.name,
          description: acceptHolder.description,
          profilePic: acceptHolder.profilePic,
        },
      },
      { merge: true }
    );

    return res.status(200).json({
      message: "Connection Request Accepted",
    });
  } catch (err) {
    console.log("Error in acceptRequest", err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
