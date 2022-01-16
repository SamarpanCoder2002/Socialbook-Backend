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
const {
  User,
  AccountThings,
  Message,
  ChatMsgTypes,
} = require("../types/types");
const formidable = require("formidable");

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

        return res.status(200).json({
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

        return res.status(200).json({
          code: 200,
          message: "Chat box created",
          chatBoxId: docRef.id,
        });
      }
    });
  } catch (e) {
    return res.status(500).json({
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
      return res.status(404).json({
        code: 404,
        error: "Problem with Image",
      });
    }

    const { chatBoxId, message, senderId, receiverId, type } = fields;
    const db = getFirestore();

    if (type !== ChatMsgTypes.text) return;

    setDoc(
      doc(db, Message.messagesCollection, chatBoxId),
      {
        [Date.now()]: { [senderId]: message },
      },
      { merge: true }
    )
      .then(() => {
        return res.status(200).json({
          code: 200,
          message: "Message added to chat box",
        });
      })
      .catch((err) => {
        console.log("error in addMessageToChatBox", err);
        return res.status(500).json({
          code: 500,
          message: "Internal Server Error",
        });
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
      return res.status(200).json({
        code: 200,
        message: "Chat connections fetched",
        chatConnections: chatConnections,
      });
    })
    .catch((err) => {
      console.log("error in getAllChatConnections", err);
      return res.status(500).json({
        code: 500,
        message: "Internal Server Error",
      });
    });
};
