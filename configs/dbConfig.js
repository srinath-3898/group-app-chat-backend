const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.RDS_DATABASE,
  process.env.RDS_USERNAME,
  process.env.RDS_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.RDS_HOSTNAME,
    port: 3306,
    logging: false,
  }
);

module.exports = sequelize;
