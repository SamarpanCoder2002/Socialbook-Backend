require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { initializeApp } = require("firebase/app");

const app = express();

/// My Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const connectionRoutes = require("./routes/connection");
const profileRoutes = require("./routes/profile");
const postRoutes = require("./routes/post");
const notificationRoutes = require("./routes/notification");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

/// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", connectionRoutes);
app.use("/api", profileRoutes);
app.use("/api", postRoutes);
app.use("/api", notificationRoutes);

// TODO: Socket IO Implementation
// const server = require('http').createServer(app);

// const io = require('socket.io')(server, {
//   transports: ['websocket', 'polling']
// });

// let tick = 0;
// // 1. listen for socket connections
// io.on('connection', client => {
//   setInterval(() => {
//     // 2. every second, emit a 'cpu' event to user
//     os.cpuUsage(cpuPercent => {
//       client.emit('cpu', {
//         name: tick++,
//         value: cpuPercent
//       });
//     });
//   }, 1000);
// });

// server.listen(8000, () => {
//   console.log('listening on *:8000');
// });

/// App Listening
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
