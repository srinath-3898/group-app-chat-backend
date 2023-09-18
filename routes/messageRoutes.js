const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getAllMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/send-message", protect, sendMessage);
router.get("/all-messages", protect, getAllMessages);

module.exports = router;
