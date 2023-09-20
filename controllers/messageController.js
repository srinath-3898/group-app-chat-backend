const Message = require("../models/messageModel");

const getAllMessages = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const currentPage = parseInt(req.query.page) || 1;
    const totalMessages = await Message.count();
    const totalPages = Math.ceil(totalMessages / pageSize);
    let limit = pageSize;
    let offset = totalMessages - currentPage * pageSize;

    if (offset < 0) {
      limit += offset;
      offset = 0;
    }
    const messages = await Message.findAll({
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
      messages: null,
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
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Can't send empty message",
      });
    }
    const message = await req.user.createMessage({
      text,
      senderName: req.user.fullName,
    });
    if (!message) {
      throw new Error(
        "Something went wrong while sending message, please try again"
      );
    }
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

module.exports = { getAllMessages, sendMessage };
