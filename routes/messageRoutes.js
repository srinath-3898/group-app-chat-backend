const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { sendMessage } = require("../controllers/messageController");

const router = express.Router();

router.post("/send-message", protect, sendMessage);

module.exports = router;
