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

module.exports = { sendMessage };
