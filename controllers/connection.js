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
const { User, ConnectionType } = require("./types/auth-prototype");

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
