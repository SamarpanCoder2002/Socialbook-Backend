const {
  getFirestore,
  getDoc,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  where,
  query,
} = require("firebase/firestore");
const { addNotification } = require("./notification");
const {
  User,
  ConnectionType,
  AccountThings,
  Message,
} = require("./types/types");

exports.connectionRequest = async (req, res) => {
  const db = getFirestore();

  /// ** Adding under sent request section
  await setDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list"),
    {
      [req.body.oppositeUserId]: ConnectionType.sent,
    },
    { merge: true }
  );

  /// ** Adding under receive request section
  await setDoc(
    doc(
      db,
      User.usersCollection,
      req.body.oppositeUserId,
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
    req.body.oppositeUserId,
    {
      prevDesignSet: { prevIndex: 2, invitationSetInitialIndex: 0 },
    }
  );

  return res.json({
    code: 200,
    message: "Connection Request Sent",
  });
};

exports.acceptRequest = async (req, res) => {
  const db = getFirestore();

  await setDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list"),
    {
      [req.body.oppositeUserId]: ConnectionType.connected,
    },
    { merge: true }
  );

  await setDoc(
    doc(
      db,
      User.usersCollection,
      req.body.oppositeUserId,
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
    req.body.oppositeUserId,
    {
      prevDesignSet: { prevIndex: 1 },
    }
  );

  return res.json({
    message: "Connection Request Accepted",
  });
};

exports.getSpecificConnections = async (req, res) => {
  const incomingRequestData = [];
  let page = req.query?.page || 1;
  if (page < 1) page = 1;

  let connectionType = ConnectionType.connected;

  if (req.params.requiredConnectionType === ConnectionType.received) {
    connectionType = ConnectionType.received;
  } else if (req.params.requiredConnectionType === ConnectionType.sent) {
    connectionType = ConnectionType.sent;
  }

  const db = getFirestore();
  const docRef = await getDoc(
    doc(db, User.usersCollection, req.auth.id, "connections", "list")
  );

  if (!docRef.exists()) {
    return res.json({
      code: 404,
      message: "No Result Found",
      data: [],
    });
  }

  const filteredData = Object.entries(docRef.data()).filter(
    ([, tempConnectionType]) => tempConnectionType === connectionType
  );

  const sortedData = filteredData.sort((first, second) =>
    first[0].localeCompare(second[0])
  );

  // ** TODO: Increase Pagination Limit Later after testing
  const requiredData = sortedData.slice((page - 1) * 4, (page - 1) * 4 + 4);

  if (!requiredData.length) {
    return res.json({
      code: 404,
      message: "No Result Found",
      data: [],
    });
  }

  for (let i = 0; i < requiredData.length; i++) {
    const userRef = await getDoc(
      doc(db, User.usersCollection, requiredData[i][0])
    );

    if (userRef.exists()) {
      incomingRequestData.push({
        id: requiredData[i][0],
        name: userRef.data().name,
        profilePic: userRef.data().profilePic,
        description: userRef.data().description,
      });
    }
  }

  return res.json({
    code: 200,
    data: incomingRequestData,
  });
};

exports.getAllAvailableUsers = async (req, res) => {
  try {
    const db = getFirestore();
    let page = req.query?.page || 1;
    if (page < 1) page = 1;

    const allUsersCollection = await getDocs(
      collection(db, User.usersCollection)
    );

    let allDocId = [];

    for (let i = 0; i < allUsersCollection.docs.length; i++) {
      if (allUsersCollection.docs[i].id !== req.auth.id)
        allDocId.push(allUsersCollection.docs[i].id);
    }

    if (!allDocId.length) {
      return res.json({
        code: 404,
        message: "No Result Found",
        data: [],
      });
    }

    const allRelatedDocCollection = await getDoc(
      doc(db, User.usersCollection, req.auth.id, "connections", "list")
    );

    if (allRelatedDocCollection.exists()) {
      let data = Object.entries(allRelatedDocCollection.data());
      data = data.map(([id]) => id);

      allDocId = allDocId.filter((id) => !data.includes(id));
    }

    // ** TODO: Increase Pagination Limit after testing to 8
    const requiredIds = allDocId.slice((page - 1) * 4, (page - 1) * 4 + 4);

    const allAvailableUsersData = [];

    for (let i = 0; i < requiredIds.length; i++) {
      const userRef = await getDoc(
        doc(db, User.usersCollection, requiredIds[i])
      );

      if (userRef.exists()) {
        allAvailableUsersData.push({
          id: requiredIds[i],
          name: userRef.data().name,
          profilePic: userRef.data().profilePic,
          description: userRef.data().description,
        });
      }
    }

    return res.json({
      code: 200,
      message: "All Available Users",
      data: allAvailableUsersData,
    });
  } catch (err) {
    console.log("Error in getAllAvailableUsers", err);
    return res.json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

exports.removeConnectedUsers = async (req, res) => {
  await removeCommonPart(req, res, ConnectionType.connected);
};

exports.withDrawSentRequest = async (req, res) => {
  await removeCommonPart(
    req,
    res,
    ConnectionType.sent,
    ConnectionType.received
  );
};

exports.removeIncomingConnectionRequest = async (req, res) => {
  await removeCommonPart(
    req,
    res,
    ConnectionType.received,
    ConnectionType.sent
  );
};

exports.particularUserConnectionStatus = async (req, res) => {
  const { userId, queryUserId } = req.params;

  getDoc(
    doc(
      getFirestore(),
      User.usersCollection,
      userId,
      AccountThings.connections,
      AccountThings.connectionsList
    )
  )
    .then((docRef) => {
      if (!docRef.exists()) {
        return res.json({
          code: 200,
          status: ConnectionType.notConnected,
        });
      }

      const data = docRef.data();

      if (data[queryUserId] === ConnectionType.received) {
        return res.json({
          code: 200,
          status: ConnectionType.received,
        });
      } else if (data[queryUserId] === ConnectionType.sent) {
        return res.json({
          code: 200,
          status: ConnectionType.sent,
        });
      } else if (data[queryUserId] === ConnectionType.connected) {
        return res.json({
          code: 200,
          status: ConnectionType.connected,
        });
      } else {
        return res.json({
          code: 200,
          status: ConnectionType.notConnected,
        });
      }
    })
    .catch((err) => {
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};

const removeCommonPart = async (
  req,
  res,
  connectionType,
  secondaryConnectionType = ConnectionType.connected
) => {
  try {
    const { oppositeUserId } = req.body;
    const db = getFirestore();

    const connectionCurrDoc = await getDoc(
      doc(
        db,
        User.usersCollection,
        req.auth.id,
        AccountThings.connections,
        AccountThings.connectionsList
      )
    );

    if (
      connectionCurrDoc.exists() &&
      connectionCurrDoc.data()[oppositeUserId] === connectionType
    ) {
      await deleteUserData(
        db,
        connectionCurrDoc.data(),
        oppositeUserId,
        req.auth.id
      );

      if (connectionType === ConnectionType.connected)
        deleteChatBoxData(db, req.auth.id, oppositeUserId);
    }

    const connectionPartnerDoc = await getDoc(
      doc(
        db,
        User.usersCollection,
        oppositeUserId,
        AccountThings.connections,
        AccountThings.connectionsList
      )
    );

    if (
      connectionPartnerDoc.exists() &&
      connectionPartnerDoc.data()[req.auth.id] === secondaryConnectionType
    )
      await deleteUserData(
        db,
        connectionPartnerDoc.data(),
        req.auth.id,
        oppositeUserId
      );

    return res.json({
      code: 200,
      message: "Operation Done Successfully 😳",
    });
  } catch (err) {
    console.log("error in removeCommonPart: ", err);

    return res.json({
      code: 500,
      message: "Internal Server Error 😔",
    });
  }
};

const deleteUserData = async (db, data, targetDelId, accHolderId) => {
  delete data[targetDelId];
  await setDoc(
    doc(
      db,
      User.usersCollection,
      accHolderId,
      AccountThings.connections,
      AccountThings.connectionsList
    ),
    data
  );
};

const deleteChatBoxData = async (db, uid, oppositeUserId) => {
  const messagingCollection = await getDocs(
    query(
      collection(db, User.usersCollection, uid, AccountThings.messaging),
      where("oppositeUserId", "==", oppositeUserId)
    )
  );

  if (messagingCollection.docs.length > 0) {
    await deleteUserMessageDocData(db, uid, messagingCollection.docs[0].id);
    await deleteUserMessageDocData(
      db,
      oppositeUserId,
      messagingCollection.docs[0].id
    );

    await deleteDoc(
      doc(db, Message.messagesCollection, messagingCollection.docs[0].id)
    );
  }
};

const deleteUserMessageDocData = async (db, targetId, chatBoxId) => {
  await deleteDoc(
    doc(db, User.usersCollection, targetId, AccountThings.messaging, chatBoxId)
  );
};
