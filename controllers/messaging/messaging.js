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
} = require("firebase/firestore");
const { User, AccountThings, Message } = require("../types/types");

exports.getChatBoxId = (req, res) => {
  const { partnerId } = req.body;
  const userId = req.auth.id;

  const db = getFirestore();

  getDocs(
    query(
      collection(db, User.usersCollection, userId, AccountThings.messaging),
      where(AccountThings.chatPartnerId, "==", partnerId)
    )
  ).then(async (chatBox) => {
    if (chatBox.docs.length > 0) {
      return res.status(200).json({
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
          partnerId: partnerId,
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
        },
        { merge: true }
      );

      return res.status(200).json({
        message: "Chat box created",
        chatBoxId: docRef.id,
      });
    }
  });
};

exports.addMessageToChatBox = (req, res) => {
  const { chatBoxId, message, creatorUserId } = req.body;
  const db = getFirestore();

  setDoc(
    doc(db, Message.messagesCollection, chatBoxId),
    {
      [Date.now()]: { [creatorUserId]: message },
    },
    { merge: true }
  )
    .then(() => {
      return res.status(200).json({
        message: "Message added to chat box",
      });
    })
    .catch((err) => {
      console.log("error in addMessageToChatBox", err);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    });
};

exports.getAllChatMessages = (req, res) => {
  const { chatBoxId } = req.body;
  const db = getFirestore();

  getDoc(doc(db, Message.messagesCollection, chatBoxId))
    .then((messages) => {
      if (messages.exists) {
        const messagesCollection = Object.entries(messages.data()).map(
          ([time, message]) => {
            return [Number(time), message];
          }
        );

        messagesCollection.sort(
          ([firstMsgTime], [secondMsgTime]) => firstMsgTime - secondMsgTime
        );

        return res.status(200).json({
          message: "Messages fetched",
          messages: messagesCollection.map(([, message]) => message),
        });
      }
      return res.status(404).json({
        message: "No Messages Found",
        messages: [],
      });
    })
    .catch((err) => {
      console.log("error in getAllChatMessages", err);

      return res.status(500).json({
        message: "Internal Server Error",
      });
    });
};
