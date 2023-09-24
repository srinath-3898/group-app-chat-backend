const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getChatMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/send-message/:chatId", protect, sendMessage);
router.get("/chat-messages/:chatId", protect, getChatMessages);

module.exports = router;
