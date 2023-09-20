const express = require("express");
const { signup, signin, signout } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signout", protect, signout);

module.exports = router;
