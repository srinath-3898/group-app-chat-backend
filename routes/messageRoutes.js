const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getChatMessages,
} = require("../controllers/messageController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post(
  "/send-message/:chatId",
  protect,
  upload.single("file"),
  sendMessage
);
router.get("/chat-messages/:chatId", protect, getChatMessages);

module.exports = router;
