const { ChatEventEnum } = require("../constants");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { emitSocketEvent } = require("../socket");

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
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res
        .status(400)
        .json({ status: false, data: null, message: "Missing chat id" });
    }
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      req
        .status(400)
        .json({ status: false, data: null, message: "Not chat found" });
    }
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Can't send empty message",
      });
    }
    const message = await chat.createMessage({
      content,
      senderName: req.user?.fullName,
      senderId: req.user.id,
    });
    if (!message) {
      throw new Error(
        "Something went wrong while sending message, please try again"
      );
    }
    const participants = await chat.getUsers();
    participants.forEach((participantObjectId) => {
      if (participantObjectId.id.toString() === req.user.id.toString()) return;
      emitSocketEvent(
        req,
        participantObjectId.id.toString(),
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        message
      );
    });
    return res
      .status(201)
      .json({ status: true, data: null, message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { getChatMessages, sendMessage };
