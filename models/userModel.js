const Sequelize = require("sequelize");
const sequelize = require("../configs/dbConfig");

class User extends Sequelize.Model {}

User.init(
  {
    fullName: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    email: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    mobile: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    password: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: "user" }
);

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
