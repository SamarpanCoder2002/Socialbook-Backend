require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { initializeApp } = require("firebase/app");

const app = express();

/// My Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const connectionRoutes = require("./routes/connection");

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

// My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", connectionRoutes);

/// App Listening
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
