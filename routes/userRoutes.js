const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  profile,
  editProfile,
  uploadProfilePicture,
} = require("../controllers/userController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/profile", protect, profile);
router.post("/edit-profile", protect, editProfile);
router.post(
  "/upload-profile-pic",
  protect,
  upload.single("file"),
  uploadProfilePicture
);

module.exports = router;
