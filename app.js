const express = require("express");
const cors = require("cors");
const sequelize = require("./configs/dbConfig");
const User = require("./models/userModel");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/authRoutes"));

const port = process.env.PORT;

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    return app.listen(port);
  })
  .then(() => console.log(`Server running on port ${port}`))
  .catch((error) => console.log(error));
