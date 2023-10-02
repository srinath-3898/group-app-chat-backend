const { ChatEventEnum } = require("../constants");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { emitSocketEvent } = require("../socket");
const { uploadToS3 } = require("../services/s3Services");
const sequelize = require("../configs/dbConfig");

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res
        .status(400)
        .json({ status: false, data: null, messgae: "Chat id is required" });
    }
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ status: false, data: null, message: "Chat not found" });
    }
    const pageSize = parseInt(req.query.pageSize) || 10;
    const currentPage = parseInt(req.query.page) || 1;
    const totalMessages = await Message.count({ where: { chatId: chat.id } });
    const totalPages = Math.ceil(totalMessages / pageSize);
    let limit = pageSize;
    let offset = totalMessages - currentPage * pageSize;
    if (offset < 0) {
      limit += offset;
      offset = 0;
    }
    const messages = await chat.getMessages({
      limit: limit,
      offset: offset,
      order: [["createdAt", "ASC"]],
    });
    if (!messages) {
      throw new Error(
        "Something went wrong while fetching messages, please try again"
      );
    }

    return res.status(200).json({
      status: true,
      data: {
        currentPage,
        lastPage: totalPages,
        data: messages,
        totalMessages,
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

const sendMessage = async (req, res) => {
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
        .status(400)
        .json({ status: false, data: null, message: "Not chat found" });
    }
    let message;
    const { content, type } = req.body;
    if (type === "text" && !content) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Can't send empty message",
      });
    }
    if (type !== "text") {
      if (!req.file) {
        return res.status(400).json({
          status: false,
          data: null,
          message: "File not provided",
        });
      }
      const file = req.file;
      const fileName = Date.now() + "-" + file.originalname;
      const s3Response = await uploadToS3({ file, fileName });
      const fileURL = s3Response.Location;
      message = await chat.createMessage(
        {
          type,
          content: file.originalname, // or you can set this to null
          senderName: req.user?.fullName,
          senderId: req.user.id,
          s3Key: fileName,
          url: fileURL,
        },
        { transaction: transaction }
      );
    } else {
      message = await chat.createMessage(
        {
          content,
          senderName: req.user?.fullName,
          senderId: req.user.id,
          type,
        },
        { transaction: transaction }
      );
    }
    if (!message) {
      throw new Error(
        "Something went wrong while sending message, please try again"
      );
    }
    const users = await chat.getUsers({ transaction: transaction });
    users.forEach((user) => {
      if (user.id.toString() === req.user.id.toString()) return;
      emitSocketEvent(
        req,
        user.id.toString(),
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        message
      );
    });
    await transaction.commit();
    return res
      .status(201)
      .json({ status: true, data: null, message: "Message sent successfully" });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { getChatMessages, sendMessage };
