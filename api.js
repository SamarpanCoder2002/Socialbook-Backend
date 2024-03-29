require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { initializeApp } = require("firebase/app");

const app = express();

// ** My Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const connectionRoutes = require("./routes/connection");
const profileRoutes = require("./routes/profile");
const postRoutes = require("./routes/post");
const notificationRoutes = require("./routes/notification");
const messagingRoutes = require("./routes/messaging");
const { getRealTimeNotifications } = require("./controllers/notification");
const { SocketEvents } = require("./controllers/types/types");
const { addPendingMessages } = require("./controllers/messaging/messaging");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// ** Initialize Firebase
initializeApp(firebaseConfig);

// ** Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// ** My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", connectionRoutes);
app.use("/api", profileRoutes);
app.use("/api", postRoutes);
app.use("/api", notificationRoutes);
app.use("/api", messagingRoutes);

// "socket.io": "^4.5.3"


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`listening on *${PORT}`);
});



// // ** Socket IO Implementation
// const server = require("http").createServer(app);
// let activeUsersCollection = [];
// const addUser = (userId, socketId) => {
//   !activeUsersCollection.some((user) => user.userId === userId) &&
//     activeUsersCollection.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   activeUsersCollection = activeUsersCollection.filter(
//     (user) => user.socketId !== socketId
//   );
// };

// const io = require("socket.io")(server, {
//   transports: ["websocket", "polling"],
//   cors: {
//     origin: process.env.FRONTEND_SOCKET_ORIGIN,
//   },
// });

// io.on(SocketEvents.connection, (socket) => {
//   console.log("New User Conected");
//   let realTimeNotificationUnsubscribe;

//   socket.on(SocketEvents.addUser, (userId) => {
//     addUser(userId, socket.id);
//     io.emit(SocketEvents.getActiveUsers, activeUsersCollection);
//   });

//   socket.on(SocketEvents.sendChatMessage, (chatBoxData) => {
//     const { chatBoxId, receiverId, senderId, message, type, time } = chatBoxData;
//     const filtered = activeUsersCollection.filter(
//       (iterateUser) => iterateUser.userId === receiverId
//     );

//     if (!filtered.length) {
//       addPendingMessages(receiverId, chatBoxId, message, type, senderId, time);
//       return;
//     }

//     io.to(filtered[0].socketId).emit(SocketEvents.acceptIncomingChatMessage, {
//       message,
//       senderId,
//       chatBoxId,
//       type,
//       time,
//     });
//   });

//   socket.on(SocketEvents.realTimeNotification, async (user) => {
//     const unsubscribe = await getRealTimeNotifications(
//       user.userId,
//       io,
//       activeUsersCollection.filter(
//         (iterateUser) => iterateUser.userId === user.userId
//       )
//     );
//     realTimeNotificationUnsubscribe = unsubscribe;
//   });

//   socket.on(SocketEvents.disconnect, () => {
//     console.log("user disconnected");
//     removeUser(socket.id);
//     realTimeNotificationUnsubscribe && realTimeNotificationUnsubscribe();
//   });
// });

// const PORT = process.env.PORT || 8000;

// server.listen(PORT, () => {
//   console.log(`listening on *${PORT}`);
// });
