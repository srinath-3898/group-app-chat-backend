const sequelize = require("../configs/dbConfig");
const Chat = require("../models/chatModel");
const GroupInvitation = require("../models/groupInvitationModel");

const updateGroupInvitationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { invitationId } = req.params;
    if (!invitationId) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing invitation id",
      });
    }
    const { status } = req.body;
    if (!status) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ status: false, data: null, message: "Missing status" });
    }
    const invitation = await GroupInvitation.findOne({
      where: { id: invitationId, userId: user.id, status: "Pending" },
      transaction: transaction,
    });
    if (!invitation) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        message: "Invalid or already responded invitation",
      });
    }
    const chat = await Chat.findByPk(invitation.chatId, {
      transaction: transaction,
    });
    if (!chat) {
      await transaction.rollback();
      return res.status(404).json({
        status: false,
        message: "Group not found",
      });
    }
    const updatedChat = await chat.addUser(user, {
      through: { isAdmin: false },
      transaction: transaction,
    });

    if (!updatedChat) {
      throw new Error(
        "Some thing went wrong while updating invitation status, please try again"
      );
    }
    const updatedInvitation = await invitation.update(
      {
        status: status ? "Accepted" : "Rejected",
      },
      { transaction: transaction }
    );
    if (!updatedInvitation) {
      throw new Error(
        "Some thing went wrong while updating invitation status, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: null,
      message: status
        ? "Joined group successfully"
        : "Successfully rejected invitation",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const getUserInvitations = async (req, res) => {
  try {
    const user = req.user;
    const invitations = await GroupInvitation.findAll({
      where: { userId: user?.id, status: "Pending" },
    });
    if (!invitations) {
      throw new Error(
        "Some thing went wrong while fetching invitations, please try again"
      );
    }
    return res
      .status(200)
      .json({ status: true, data: { invitations }, message: null });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { updateGroupInvitationStatus, getUserInvitations };
