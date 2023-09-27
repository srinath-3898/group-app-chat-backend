const Sequelize = require("sequelize");
const sequelize = require("../configs/dbConfig");

class Chat extends Sequelize.Model {}

Chat.init(
  {
    name: { type: Sequelize.DataTypes.STRING(255) },
    description: { type: Sequelize.DataTypes.TEXT, allowNull: true },
    isGroup: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { sequelize, modelName: "chat" }
);

module.exports = Chat;
