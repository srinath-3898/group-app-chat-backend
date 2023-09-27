const exress = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  updateGroupInvitationStatus,
  getUserInvitations,
} = require("../controllers/groupInvitationController");

const router = exress.Router();

router.post(
  "/update-status/:invitationId",
  protect,
  updateGroupInvitationStatus
);
router.get("/user-invitations", protect, getUserInvitations);

module.exports = router;
