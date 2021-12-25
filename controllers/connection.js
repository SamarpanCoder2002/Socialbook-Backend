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
  Post,
  Message,
} = require("./types/types");

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
  let page = req.query?.page || 1;
  if (page < 1) page = 1;

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

  const requiredData = filteredData.slice((page - 1) * 10, page * 10);

  if(!requiredData.length) {
    return res.status(404).json({
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

  return res.status(200).json({
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

    const allDocId = [];

    for (let i = 0; i < allUsersCollection.docs.length; i++) {
      if (allUsersCollection.docs[i].id !== req.auth.id)
        allDocId.push(allUsersCollection.docs[i].id);
    }

    const requiredIds = allDocId.slice((page - 1) * 12, page * 12);

    if (!requiredIds.length) {
      return res.status(404).json({
        code: 404,
        message: "No Result Found",
        data: [],
      });
    }

    const allRelatedDocCollection = await getDoc(
      doc(db, User.usersCollection, req.auth.id, "connections", "list")
    );

    if (allRelatedDocCollection.exists()) {
      const data = Object.entries(allRelatedDocCollection.data());
      data.forEach(([docId, _]) => {
        requiredIds.splice(requiredIds.indexOf(docId), 1);
      });
    }

    const allAvailableUsersData = [];

    for (let i = 0; i < requiredIds.length; i++) {
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
      code: 200,
      message: "All Available Users",
      data: allAvailableUsersData,
    });
  } catch (err) {
    console.log("Error in getAllAvailableUsers", err);
    return res.status(500).json({
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

const removeCommonPart = async (
  req,
  res,
  connectionType,
  secondaryConnectionType = ConnectionType.connected
) => {
  try {
    const { partnerId } = req.body;
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
      connectionCurrDoc.data()[partnerId] === connectionType
    ) {
      await deleteUserData(
        db,
        connectionCurrDoc.data(),
        partnerId,
        req.auth.id
      );

      if (connectionType === ConnectionType.connected)
        deleteChatBoxData(db, req.auth.id, partnerId);
    }

    const connectionPartnerDoc = await getDoc(
      doc(
        db,
        User.usersCollection,
        partnerId,
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
        partnerId
      );

    return res.status(200).json({
      code: 200,
      message: "Operation Done Successfully 😳",
    });
  } catch (err) {
    console.log("error in removeCommonPart: ", err);

    return res.status(500).json({
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

const deleteChatBoxData = async (db, uid, partnerId) => {
  const messagingCollection = await getDocs(
    query(
      collection(db, User.usersCollection, uid, AccountThings.messaging),
      where("partnerId", "==", partnerId)
    )
  );

  if (messagingCollection.docs.length > 0) {
    await deleteUserMessageDocData(db, uid, messagingCollection.docs[0].id);
    await deleteUserMessageDocData(
      db,
      partnerId,
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
