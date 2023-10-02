const Sequelize = require("sequelize");
const sequelize = require("../configs/dbConfig");

class Message extends Sequelize.Model {}

Message.init(
  {
    content: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    senderName: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    type: {
      type: Sequelize.DataTypes.ENUM("text", "image", "pdf", "document"),
      allowNull: false,
    },
    senderId: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
    s3Key: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    url: {
      type: Sequelize.DataTypes.STRING(2000),
      allowNull: true,
      defaultValue: null,
    },
  },
  { sequelize, modelName: "message" }
);

module.exports = Message;
