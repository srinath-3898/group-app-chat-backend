const { ChatEventEnum } = require("../constants");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const mountJoinChatEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log(`User joined the chat. chatId: `, chatId);
    socket.join(chatId);
  });
};

const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error("Token is missing");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        throw new Error("Invalid token");
      }
      const user = await User.findByPk(decoded?.id);
      if (!user) {
        throw new Error("Not authorized");
      }
      socket.user = user;
      socket.join(user.id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log("User connected. userId: ", user.id.toString());
      mountJoinChatEvent(socket);
      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("user has disconnected. userId: " + socket.user?._id);
        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  console.log(req.app.get("io"));
  req.app.get("io").in(roomId).emit(event, payload);
};

module.exports = { initializeSocketIO, emitSocketEvent };
