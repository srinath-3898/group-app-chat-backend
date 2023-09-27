const Sequelize = require("sequelize");
const User = require("../models/userModel");

const profile = async (req, res) => {
  try {
    return res.status(200).json({
      status: true,
      data: { userDetails: req.user },
      message: null,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const { fullName, email, mobile } = req.body;
    if (!fullName || !email || !mobile) {
      return res
        .status(400)
        .json({ status: false, data: null, message: "Missing require fields" });
    }
    const updatedUser = await req.user.update({ fullName, email, mobile });
    if (!updatedUser) {
      throw new Error(
        "Something went wrong while updating your details, please try again"
      );
    }
    return res.status(201).json({
      status: true,
      data: { userDetails: updatedUser },
      message: "Successfully updated user details",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { profile, editProfile };
