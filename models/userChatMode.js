const Sequelize = require("sequelize");

const sequelize = require("../configs/dbConfig");

class UserChat extends Sequelize.Model {}

UserChat.init(
  {
    isAdmin: { type: Sequelize.DataTypes.BOOLEAN, allowNull: false },
  },
  { sequelize, modelName: "userChat" }
);

module.exports = UserChat;
