const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getChats, createGroupChat } = require("../controllers/chatController");

const router = express.Router();

router.get("/chats", protect, getChats);
router.post("/create-group", protect, createGroupChat);

module.exports = router;
