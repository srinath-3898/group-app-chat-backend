const Sequelize = require("sequelize");
const sequelize = require("../configs/dbConfig");
const Chat = require("../models/chatModel");
const GroupInvitation = require("../models/groupInvitationModel");
const User = require("../models/userModel");
const UserChat = require("../models/userChatMode");

const getChats = async (req, res) => {
  try {
    const user = req.user;
    const chats = await user.getChats({ through: { attributes: ["isAdmin"] } });
    if (!chats) {
      throw new Error(
        "Something went wrong while fetching chats, please try again"
      );
    }
    return res
      .status(200)
      .json({ status: true, data: { chats }, message: null });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const currentPage = parseInt(req.query.page) || 1;
    const totalRecords = (await User.count()) - 1;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const users = await User.findAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      attributes: ["id", "fullName", "email", "mobile", "loginStatus"],
      where: { id: { [Sequelize.Op.not]: req.user.id } },
    });
    if (!users) {
      throw new Error(
        "Something went wrong while fetching users, please try again"
      );
    }
    return res.status(200).json({
      status: true,
      data: {
        currentPage,
        lastPage: totalPages,
        users: users,
        totalRecords,
      },
      message: null,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const getChatUsers = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res
        .status(400)
        .json({ status: false, data: null, message: "Missing chat id" });
    }
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ status: false, data: null, message: "No chat found " });
    }
    const users = await chat.getUsers({ through: { attributes: ["isAdmin"] } });
    if (!users) {
      throw new Error(
        "Some thing went wring while fetching users please try again"
      );
    }
    return res
      .status(200)
      .json({ status: true, data: { users }, message: null });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const addUsersToChat = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { chatId, userIds } = req.body;
    if (!chatId || !userIds) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing chat id or user id",
      });
    }
    const usersToAdd = await User.findAll({
      where: { id: userIds },
      transaction: transaction,
    });
    if (usersToAdd?.length !== userIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        status: false,
        data: null,
        messgae: "Some usere were not found",
      });
    }
    const chats = await user.getChats({
      where: { id: chatId },
      through: { attributes: ["isAdmin"] },
      transaction: transaction,
    });
    if (chats.length === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ status: false, data: null, message: "No chat found" });
    }
    const chat = chats[0];
    if (!chat.userChat.isAdmin) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "You don't have permissions to add user to this group",
      });
    }
    const usersAlreadyPresent = await chat.getUsers({
      where: { id: userIds },
      through: { attributes: ["isAdmin"] },
      transaction: transaction,
    });
    if (usersAlreadyPresent.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "some users already present in this chat",
      });
    }
    const alreadyInvited = await GroupInvitation.findAll({
      where: { userId: userIds, status: "Pending" },
      transaction: transaction,
    });

    if (alreadyInvited.length !== 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Some users are already invited to join this group",
      });
    }
    const invitations = await GroupInvitation.bulkCreate(
      userIds.map((userId) => ({
        chatId: chat.id,
        userId,
        chatName: chat.name,
      })),
      { transaction: transaction }
    );
    if (!invitations) {
      throw new Error(
        "Something went wrong while adding users, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: null,
      message: "Users added successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const removeUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { userId, chatId } = req.body;
    if (!userId || !chatId) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing user id or chat id",
      });
    }
    const userToRemove = await User.findByPk(userId, {
      transaction: transaction,
    });
    if (!userToRemove) {
      await transaction.rollback();
      return res.status(404).json({
        status: false,
        data: null,
        message: "User not found",
      });
    }
    const chats = await user.getChats({
      where: { id: chatId },
      through: { attributes: ["isAdmin"] },
      transaction,
    });
    if (chats?.length === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ status: false, data: null, message: "Chat not found" });
    }
    const chat = chats[0];
    if (!chat.userChat.isAdmin) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "You don't have permissions to make this user as admin",
      });
    }
    const userChatRecord = await UserChat.findOne({
      where: { chatId: chatId, userId: userId },
      transaction: transaction,
    });
    if (!userChatRecord) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ status: false, data: null, message: "User or chat not found" });
    }
    const deletedChatRecord = await userChatRecord.destroy({
      transaction: transaction,
    });
    if (!deletedChatRecord) {
      throw new Error(
        "Something went wrong while removing user, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: false,
      data: null,
      message: "Successfully removed user",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const makeUserAdmin = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { userId, chatId } = req.body;
    if (!userId || !chatId) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing user id or chat id",
      });
    }
    const userToMakeAdmin = await User.findByPk(userId, {
      transaction: transaction,
    });
    if (!userToMakeAdmin) {
      await transaction.rollback();
      return res.status(404).json({
        status: false,
        data: null,
        message: "User not found",
      });
    }
    const chats = await user.getChats({
      where: { id: chatId },
      through: { attributes: ["isAdmin"] },
      transaction,
    });
    if (chats?.length === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ status: false, data: null, message: "Chat not found" });
    }
    const chat = chats[0];
    if (!chat.userChat.isAdmin) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "You don't have permissions to make this user as admin",
      });
    }
    const userChatRecord = await UserChat.findOne({
      where: { chatId: chatId, userId: userId },
      transaction: transaction,
    });
    if (!userChatRecord) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ status: false, data: null, message: "User or chat not found" });
    }
    const updatedUserChatRecord = await userChatRecord.update(
      {
        isAdmin: true,
      },
      { transaction: transaction }
    );
    if (!updatedUserChatRecord) {
      throw new Error(
        "Something went wrong while making the user as admin, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: null,
      message: "User made as admin successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const removeAdminAccess = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { userId, chatId } = req.body;
    if (!userId || !chatId) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing user id or chat id",
      });
    }
    const userToMakeAdmin = await User.findByPk(userId, {
      transaction: transaction,
    });
    if (!userToMakeAdmin) {
      await transaction.rollback();
      return res.status(404).json({
        status: false,
        data: null,
        message: "User not found",
      });
    }
    const chats = await user.getChats({
      where: { id: chatId },
      through: { attributes: ["isAdmin"] },
      transaction: transaction,
    });
    if (chats?.length === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ status: false, data: null, message: "Chat not found" });
    }
    const chat = chats[0];
    if (!chat.userChat.isAdmin) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message:
          "You don't have permissions to remove admin access to this user",
      });
    }
    const userChatRecord = await UserChat.findOne({
      where: { chatId: chatId, userId: userId },
      transaction: transaction,
    });
    if (!userChatRecord) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ status: false, data: null, message: "User or chat not found" });
    }
    const updatedUserChatRecord = await userChatRecord.update(
      {
        isAdmin: false,
      },
      { transaction: transaction }
    );
    if (!updatedUserChatRecord) {
      throw new Error(
        "Something went wrong while making the user as admin, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: false,
      data: updatedUserChatRecord,
      message: "Successfully removed admin access",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const createGroupChat = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { name, description, userIds } = req.body;
    if (!name || !userIds) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const usersToAdd = await User.findAll({
      where: { id: userIds },
      transaction: transaction,
    });
    if (userIds.length !== usersToAdd.length) {
      throw new Error("Some users were not found");
    }
    const newChat = await Chat.create(
      {
        name,
        description,
        isGroup: true,
      },
      { transaction: transaction }
    );
    if (!newChat) {
      throw new Error(
        "Something went wrong while creating group, please try again"
      );
    }
    const invitations = await GroupInvitation.bulkCreate(
      userIds.map((userId) => ({
        chatId: newChat.id,
        userId,
        chatName: newChat.name,
      })),
      { transaction: transaction }
    );
    if (!invitations) {
      throw new Error(
        "Something went wrong while creating group, please try again"
      );
    }
    const updatedChat = await newChat.addUser(user, {
      through: { isAdmin: true },
      transaction: transaction,
    });
    if (!updatedChat) {
      throw new Error(
        "Something went wrong while creating group, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: null,
      message: "Group created successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const uploadChatIcon = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { chatId } = req.params;
    if (!chatId) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ status: false, data: null, message: "Missing chat id" });
    }
    const chat = await Chat.findByPk(chatId, { transaction: transaction });
    if (!chat) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ status: false, data: null, message: "Chat not found" });
    }
    if (!req.file) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "File not provided",
      });
    }
    const icon = req.file;
    const fileName = Date.now() + "-" + icon.originalname + chat?.name;
    const s3Response = await uploadToS3({ file: icon, fileName });
    const fileURL = s3Response.Location;
    const updatedChat = await Chat.update(
      { icon: fileURL },
      { transaction: transaction }
    );
    if (!updatedChat) {
      throw new Error(
        "Something went wrong while uploading profile pic, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: { userDetails: updatedUser },
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = {
  getChats,
  createGroupChat,
  getChatUsers,
  getUsers,
  addUsersToChat,
  removeUser,
  makeUserAdmin,
  removeAdminAccess,
  uploadChatIcon,
};
