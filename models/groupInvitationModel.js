const Sequelize = require("sequelize");
const sequelize = require("../configs/dbConfig");

class GroupInvitation extends Sequelize.Model {}

GroupInvitation.init(
  {
    chatName: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    status: {
      type: Sequelize.DataTypes.ENUM("Pending", "Accepted", "Rejected"),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  { sequelize, modelName: "groupInvitation" }
);

module.exports = GroupInvitation;
