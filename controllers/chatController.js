const sequelize = require("../configs/dbConfig");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const getChats = async (req, res) => {
  try {
    const user = req.user;
    const chats = await user.getChats();
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

const createGroupChat = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { name, description, userIds } = req.body;
    if (!name || !userIds) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const newChat = await Chat.create(
      {
        name,
        description,
        isGroup: true,
        adminId: user.id,
      },
      { transaction }
    );
    if (!newChat) {
      transaction.rollback();
      throw new Error(
        "Something went wrong while creating group, please try again"
      );
    }
    const usersToAdd = await User.findAll(
      { where: { id: [...userIds, user.id] } },
      { transaction }
    );
    if (userIds.length + 1 !== usersToAdd.length) {
      throw new Error("Some users were not found");
    }
    const updatedChat = await newChat.addUsers(usersToAdd, { transaction });
    if (!updatedChat) {
      throw new Error(
        "Something went wrong while creating group, please try again"
      );
    }
    transaction.commit();
    return res.status(201).json({
      status: true,
      data: null,
      message: "Group created successfully",
    });
  } catch (error) {
    transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { getChats, createGroupChat };
