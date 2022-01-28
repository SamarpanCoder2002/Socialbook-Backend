const {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  getDoc,
  deleteDoc,
} = require("firebase/firestore");
const {
  User,
  AccountThings,
  Message,
  ChatMsgTypes,
} = require("../types/types");
const formidable = require("formidable");
const { uploadFileInStorage } = require("../post-collection/upload-in-storage");
const fs = require("fs");
const {
  messageEncryption,
  messageDecryption,
} = require("../encryption-management/encrypt-decrypt-management");

exports.getChatBoxId = (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      partnerDescription,
      partnerProfilePic,
      currentName,
      currentDescription,
      currentProfilePic,
    } = req.body;
    const userId = req.auth.id;

    const db = getFirestore();

    getDocs(
      query(
        collection(db, User.usersCollection, userId, AccountThings.messaging),
        where(AccountThings.chatPartnerId, "==", partnerId)
      )
    ).then(async (chatBox) => {
      if (chatBox.docs.length > 0) {
        setDoc(
          doc(
            db,
            User.usersCollection,
            userId,
            AccountThings.messaging,
            chatBox.docs[0].id
          ),
          {
            partnerId,
            partnerName,
            partnerDescription,
            partnerProfilePic,
          },
          { merge: true }
        );

        return res.json({
          code: 200,
          message: "Chat box already exists",
          chatBoxId: chatBox.docs[0].id,
        });
      } else {
        const docRef = await addDoc(
          collection(db, Message.messagesCollection),
          {}
        );

        await setDoc(
          doc(
            db,
            User.usersCollection,
            userId,
            AccountThings.messaging,
            docRef.id
          ),
          {
            partnerId,
            partnerName,
            partnerDescription,
            partnerProfilePic,
          },
          { merge: true }
        );

        await setDoc(
          doc(
            db,
            User.usersCollection,
            partnerId,
            AccountThings.messaging,
            docRef.id
          ),
          {
            partnerId: userId,
            partnerName: currentName,
            partnerDescription: currentDescription,
            partnerProfilePic: currentProfilePic,
          },
          { merge: true }
        );

        return res.json({
          code: 200,
          message: "Chat box created",
          chatBoxId: docRef.id,
        });
      }
    });
  } catch (e) {
    return res.json({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

exports.addMessageToChatBox = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.json({
        code: 404,
        error: "Problem with incoming Image",
      });
    }

    const { type } = fields;

    if (type !== ChatMsgTypes.text)
      return await sendImageMessage(fields, res, files.message);
    return sendTextMessage(fields, res);
  });
};

const sendImageMessage = async (fields, res, rawImgFile) => {
  const db = getFirestore();
  const currentTime = Date.now();
  const { chatBoxId, senderId } = fields;

  if (rawImgFile.size > 2000000) {
    return res.json({
      code: 400,
      message:
        "Last Message Picture size too large... Please upload a Picture Within 2MB",
    });
  }

  const uploadedFileLink = await uploadFileInStorage(
    fs.readFileSync(rawImgFile.filepath),
    `${currentTime}-image-${senderId}.jpg`,
    `messageBox/${chatBoxId}/images`,
    rawImgFile.mimetype
  );

  const encryptedImgDataLink = messageEncryption(uploadedFileLink);

  setDoc(
    doc(db, Message.messagesCollection, chatBoxId),
    {
      [Date.now()]: {
        message: encryptedImgDataLink,
        type: ChatMsgTypes.image,
        holder: senderId,
      },
    },
    { merge: true }
  )
    .then(() => {
      return res.json({
        code: 200,
        message: "Message added to chat box",
        data: uploadedFileLink,
      });
    })
    .catch((err) => {
      console.log("error in addMessageToChatBox", err);
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};

const sendTextMessage = (fields, res) => {
  const db = getFirestore();
  const { chatBoxId, message, senderId } = fields;

  const encryptedMsgDataLink = messageEncryption(message);

  setDoc(
    doc(db, Message.messagesCollection, chatBoxId),
    {
      [Date.now()]: {
        message: encryptedMsgDataLink,
        type: ChatMsgTypes.text,
        holder: senderId,
      },
    },
    { merge: true }
  )
    .then(() => {
      return res.json({
        code: 200,
        message: "Message added to chat box",
      });
    })
    .catch((err) => {
      console.log("error in addMessageToChatBox", err);
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};

exports.getAllChatMessages = (req, res) => {
  const chatBoxId = req.params.chatBoxId;
  const db = getFirestore();

  getDoc(doc(db, Message.messagesCollection, chatBoxId))
    .then((messages) => {
      if (messages.exists) {
        const messagesCollection = Object.entries(messages.data()).map(
          ([time, message]) => {
            return [Number(time), { ...message, time: Number(time) }];
          }
        );

        messagesCollection.sort((first, second) => first[0] - second[0]);

        return res.json({
          code: 200,
          message: "Messages fetched",
          data:
            messagesCollection?.map((message) => {
              return {
                ...message[1],
                message: messageDecryption(message[1].message),
              };
            }) || [],
        });
      }
      return res.json({
        message: "No Messages Found",
        messages: [],
      });
    })
    .catch((err) => {
      console.log("error in getAllChatMessages", err);

      return res.json({
        message: "Internal Server Error",
      });
    });
};

exports.getAllChatConnections = (req, res) => {
  const userId = req.auth.id;
  const db = getFirestore();

  getDocs(
    query(collection(db, User.usersCollection, userId, AccountThings.messaging))
  )
    .then((querySnapShot) => {
      const chatConnections = querySnapShot.docs.map((doc) => {
        const {
          partnerId,
          partnerName,
          partnerDescription,
          partnerProfilePic,
        } = doc.data();
        return {
          partnerId: partnerId,
          chatBoxId: doc.id,
          partnerName: partnerName,
          partnerDescription: partnerDescription,
          partnerProfilePic: partnerProfilePic,
        };
      });
      return res.json({
        code: 200,
        message: "Chat connections fetched",
        chatConnections: chatConnections,
      });
    })
    .catch((err) => {
      console.log("error in getAllChatConnections", err);
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};



exports.addPendingMessages = (
  receiverId,
  chatBoxId,
  message,
  type,
  partnerId,
  time
) => {
  const db = getFirestore();

  setDoc(
    doc(
      db,
      User.usersCollection,
      receiverId,
      AccountThings.pendingMessaging,
      chatBoxId
    ),
    {
      message: messageEncryption(
        message.length > 20 ? message.toString().slice(0, 20) + "..." : message
      ),
      type,
      partnerId,
      time,
    }
  ).catch((e) => {
    console.log("Error in addPendingMessages", e);
  });
};

exports.removePendingMessage = (req, res) => {
  const db = getFirestore();
  const chatBoxId = req.params.chatBoxId;

  deleteDoc(
    doc(
      db,
      User.usersCollection,
      req.auth.id,
      AccountThings.pendingMessaging,
      chatBoxId
    )
  )
    .then(() => {
      return res.json({
        code: 200,
        message: "Pending message removed",
      });
    })
    .catch((e) => {
      console.log("Error in removePendingMessage", e);
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};

exports.getPendingChatMessages = (req, res) => {
  const userId = req.auth.id;
  const db = getFirestore();

  getDocs(
    query(
      collection(
        db,
        User.usersCollection,
        userId,
        AccountThings.pendingMessaging
      )
    )
  )
    .then((querySnapShot) => {
      if (querySnapShot.empty)
        return res.json({
          code: 404,
          message: "No Pending Messages Found",
          pendingMessages: [],
        });

      const pendingMessages = querySnapShot.docs.map((doc) => {
        const { message, type, partnerId, time } = doc.data();

        return {
          message: messageDecryption(message),
          type: type,
          chatBoxId: doc.id,
          partnerId,
          time,
        };
      });
      return res.json({
        code: 200,
        message: "Pending messages fetched",
        pendingMessages: pendingMessages,
      });
    })
    .catch((err) => {
      console.log("error in getPendingChatMessages", err);
      return res.json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};

exports.addPendingChatMessagesWithController = (req, res) => {
  const { 
   chatBoxId,
   message,
   type,
   partnerId,
   time} = req.body;
 
  this.addPendingMessages(req.auth.id, chatBoxId, message, type, partnerId, time);

  return res.json({
    code: 200,
    message: "Pending message added",
  })
 }

// exports.getPaginatedChatMesssages = (req, res) => {
//   const chatBoxId = req.params.chatBoxId;
//   const db = getFirestore();
//   const pageId = Number(req.params.pageId) - 1 || 0;

//   getDoc(doc(db, Message.messagesCollection, chatBoxId))
//     .then((messages) => {
//       if (messages.exists) {
//         const messagesCollection = Object.entries(messages.data()).map(
//           ([time, message]) => {
//             return [Number(time), { ...message, time: Number(time) }];
//           }
//         );

//         messagesCollection.sort((first, second) => second[0] - first[0]);

//         const paginatedMessagesCollection = messagesCollection.slice(
//           pageId * 10,
//           pageId * 10 + 10
//         );

//         paginatedMessagesCollection.sort(
//           (first, second) => first[0] - second[0]
//         );

//         return res.json({
//           code: 200,
//           message: "Messages fetched",
//           data: paginatedMessagesCollection?.map((message) => message[1]) || [],
//         });
//       }
//       return res.json({
//         message: "No Messages Found",
//         messages: [],
//       });
//     })
//     .catch((err) => {
//       console.log("error in getAllChatMessages", err);

//       return res.json({
//         message: "Internal Server Error",
//       });
//     });
// };
