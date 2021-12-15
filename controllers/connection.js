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
const { User, ConnectionType } = require("./types/types");

exports.connectionRequest = async (req, res) => {
  const db = getFirestore();

  /// Adding under sent request section
  await setDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list"),
    {
      [req.body.oppositeUser.id]: ConnectionType.sent,
    }
  );

  /// Adding under receive request section
  await setDoc(
    doc(
      db,
      User.usersCollection,
      req.body.oppositeUser.id,
      "connections",
      "list"
    ),
    {
      [req.auth.id]: ConnectionType.received,
    }
  );

  return res.status(200).json({
    message: "Connection Request Sent",
  });
};

exports.acceptRequest = async (req, res) => {
  const db = getFirestore();

  await setDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list"),
    {
      [req.body.requestHolder.id]: ConnectionType.connected,
    },
    { merge: true }
  );

  await setDoc(
    doc(
      db,
      User.usersCollection,
      req.body.requestHolder.id,
      "connections",
      "list"
    ),
    {
      [req.auth.id]: ConnectionType.connected,
    },
    { merge: true }
  );

  return res.status(200).json({
    message: "Connection Request Accepted",
  });
};

exports.getSpecificConnections = async (req, res) => {
  const incomingRequestData = [];

  let connectionType = ConnectionType.connected;

  if (req.params.requiredConnectionType === "received") {
    connectionType = ConnectionType.received;
  } else if (req.params.requiredConnectionType === "sent") {
    connectionType = ConnectionType.sent;
  }

  const db = getFirestore();
  const docRef = await getDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list")
  );

  if (!docRef.exists()) {
    return res.status(200).json({
      message: "No Result Found",
      data: [],
    });
  }

  const filteredData = Object.entries(docRef.data()).filter(
    ([, tempConnectionType]) => tempConnectionType === connectionType
  );

  for (let i = 0; i < filteredData.length; i++) {
    const userRef = await getDoc(
      doc(db, User.usersCollection, filteredData[i][0])
    );

    if (userRef.exists()) {
      incomingRequestData.push({
        id: filteredData[i][0],
        name: userRef.data().name,
        profilePic: userRef.data().profilePic,
        description: userRef.data().description,
      });
    }
  }

  return res.status(200).json({
    data: incomingRequestData,
  });
};
