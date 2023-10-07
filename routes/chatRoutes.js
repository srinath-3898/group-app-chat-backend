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
  uploadChatIcon,
} = require("../controllers/chatController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/chats", protect, getChats);
router.get("/all-users", protect, getUsers);
router.get("/:chatId/chat-users", protect, getChatUsers);
router.post("/create-group", protect, createGroupChat);
router.post("/add-users", protect, addUsersToChat);
router.post("/remove-user", protect, removeUser);
router.post("/user-admin", protect, makeUserAdmin);
router.post("/user-remove-admin", protect, removeAdminAccess);
router.post(
  "/upload-chat-icon",
  protect,
  upload.single("file"),
  uploadChatIcon
);

module.exports = router;
