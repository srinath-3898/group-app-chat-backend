const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { fullName, email, mobile, password, confirm_password } = req.body;
    if (!fullName || !email || !mobile || !password || !confirm_password) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Passwords didn't matched",
      });
    }
    const user_exists = await User.findOne({ where: { email } });
    if (user_exists) {
      return res.status(409).json({
        status: false,
        data: null,
        message: "You already have an account, please signin to continue",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
    });
    if (!user) {
      await transaction.rollback();
      throw new Error(
        "Some thing went wrong while signing up, please try again"
      );
    }
    return res.status(201).json({
      status: true,
      data: user,
      message: "Signedup successfully, please signin to continue...",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};
module.exports = { signup };
