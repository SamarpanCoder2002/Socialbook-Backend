const {
  getFirestore,
  getDoc,
  doc,
  setDoc,
  collection,
  getDocs,
} = require("firebase/firestore");
const { addNotification } = require("./notification");
const { User, ConnectionType } = require("./types/types");

exports.connectionRequest = async (req, res) => {
  const db = getFirestore();

  /// ** Adding under sent request section
  await setDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list"),
    {
      [req.body.oppositeUser.id]: ConnectionType.sent,
    },
    { merge: true }
  );

  /// ** Adding under receive request section
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
    },
    { merge: true }
  );

  await addNotification("Connection Request Sent", `/connection`, req.auth.id, {
    prevDesignSet: { prevIndex: 2, invitationSetInitialIndex: 1 },
  });

  await addNotification(
    "Someone Sent you a Connection Request",
    `/connection`,
    req.body.oppositeUser.id,
    {
      prevDesignSet: { prevIndex: 2, invitationSetInitialIndex: 0 },
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

  addNotification(
    "😇 Congrats! You have now new connection",
    `/connection`,
    req.auth.id,
    {
      prevDesignSet: { prevIndex: 1 },
    }
  );

  addNotification(
    "😇 Congrats! You have now new connection",
    `/connection`,
    req.body.requestHolder.id,
    {
      prevDesignSet: { prevIndex: 1 },
    }
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

exports.getAllAvailableUsers = async (req, res) => {
  try {
    const db = getFirestore();

    const allUsersCollection = await getDocs(
      collection(db, User.usersCollection)
    );

    const allDocId = [];

    for (let i = 0; i < allUsersCollection.docs.length; i++) {
      if (allUsersCollection.docs[i].id !== req.auth.id)
        allDocId.push(allUsersCollection.docs[i].id);
    }

    const allRelatedDocCollection = await getDoc(
      doc(db, User.usersCollection, req.auth.id, "connections", "list")
    );

    if (allRelatedDocCollection.exists()) {
      const data = Object.entries(allRelatedDocCollection.data());
      data.forEach(([docId, _]) => {
        allDocId.splice(allDocId.indexOf(docId), 1);
      });
    }

    const allAvailableUsersData = [];

    for (let i = 0; i < allDocId.length; i++) {
      const userRef = await getDoc(doc(db, User.usersCollection, allDocId[i]));

      if (userRef.exists()) {
        allAvailableUsersData.push({
          id: allDocId[i],
          name: userRef.data().name,
          profilePic: userRef.data().profilePic,
          description: userRef.data().description,
        });
      }
    }

    return res.status(200).json({
      message: "All Available Users",
      data: allAvailableUsersData,
    });
  } catch (err) {
    console.log("Error in getAllAvailableUsers", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
