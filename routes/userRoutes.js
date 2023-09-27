const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { profile, editProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, profile);
router.post("/edit-profile", protect, editProfile);

module.exports = router;
