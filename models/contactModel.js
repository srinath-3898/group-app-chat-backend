const Seuelize = require("sequelize");
const sequelize = require("../configs/dbConfig");

class Contact extends Seuelize.Model {}

Contact.init(
  {
    name: { type: Seuelize.DataTypes.STRING(255), allowNull: false },
    email: { type: Seuelize.DataTypes.STRING(255), allowNull: false },
    mobile: { type: Seuelize.DataTypes.STRING(255), allowNull: false },
  },
  { sequelize: sequelize, modelName: "contact" }
);

module.exports = Contact;
