const Sequelize = require("sequelize");
const sequelize = require("../configs/dbConfig");

class Message extends Sequelize.Model {}

Message.init(
  {
    text: { type: Sequelize.DataTypes.TEXT, allowNull: false },
    senderName: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: "message" }
);

module.exports = Message;
