const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const { fullName, email, mobile, password, confirmPassword } = req.body;
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Passwords didn't matched",
      });
    }
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({
        status: false,
        data: null,
        message: "You already have an account, please signin to continue",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      loginStatus: false,
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
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const generateToken = ({ id, fullName, email, mobile }) =>
  jwt.sign({ id, fullName, email, mobile }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing email or password",
      });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, data: null, message: "User not found" });
    }
    const comparedPassword = await bcrypt.compare(password, user.password);
    if (user && !comparedPassword) {
      return res
        .status(403)
        .json({ status: false, data: null, message: "Invalid credentials" });
    }
    const updateLoginStatus = await user.update({ loginStatus: true });
    if (!updateLoginStatus) {
      throw new Error(
        "Something went wrong while logging in, please try again"
      );
    }
    const token = generateToken(user);
    return res.status(201).json({
      status: true,
      data: { token },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const signout = async (req, res) => {
  try {
    const user = req.user;
    const updatedUser = await user.update({ loginStatus: false });
    if (!updatedUser) {
      throw new Error(
        "Something went wrong while logging out, please try again"
      );
    }
    return res
      .status(200)
      .json({ status: true, data: null, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { signup, signin, signout };
