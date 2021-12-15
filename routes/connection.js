const express = require("express");
const { isSignedIn } = require("../controllers/auth");
const { ConnectionRequest } = require("../controllers/connection");
const router = express.Router();

router.post("/connect-request", isSignedIn, ConnectionRequest);

module.exports = router;