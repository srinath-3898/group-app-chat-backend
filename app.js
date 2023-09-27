const express = require("express");
const cors = require("cors");
const sequelize = require("./configs/dbConfig");
const User = require("./models/userModel");
const Message = require("./models/messageModel");
const Chat = require("./models/chatModel");
const GroupInvitation = require("./models/groupInvitationModel");
const UserChat = require("./models/userChatMode");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/authRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/message", require("./routes/messageRoutes"));
app.use("/chat", require("./routes/chatRoutes"));
app.use("/group-invitation", require("./routes/groupInvitationRoutes"));

User.belongsToMany(Chat, { through: "userChat" });
Chat.belongsToMany(User, { through: "userChat" });

Message.belongsTo(Chat);
Chat.hasMany(Message);

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { as: "sender" });

Chat.hasMany(GroupInvitation);
GroupInvitation.belongsTo(Chat);

User.hasMany(GroupInvitation);
GroupInvitation.belongsTo(User);

const port = process.env.PORT;

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    return app.listen(port);
  })
  .then(() => console.log(`Server running on port ${port}`))
  .catch((error) => console.log(error));
