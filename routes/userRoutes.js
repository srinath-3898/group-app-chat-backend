const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  profile,
  editProfile,
  getUsers,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, profile);
router.post("/edit-profile", protect, editProfile);
router.get("/users", protect, getUsers);

module.exports = router;
