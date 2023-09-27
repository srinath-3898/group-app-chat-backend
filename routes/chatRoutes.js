const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getChats,
  createGroupChat,
  getUsers,
  addUsersToChat,
  makeUserAdmin,
  getChatUsers,
  removeAdminAccess,
  removeUser,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/chats", protect, getChats);
router.get("/all-users", protect, getUsers);
router.get("/:chatId/chat-users", protect, getChatUsers);
router.post("/create-group", protect, createGroupChat);
router.post("/add-users", protect, addUsersToChat);
router.post("/remove-user", protect, removeUser);
router.post("/user-admin", protect, makeUserAdmin);
router.post("/user-remove-admin", protect, removeAdminAccess);

module.exports = router;
