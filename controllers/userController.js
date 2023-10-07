const sequelize = require("../configs/dbConfig");
const { uploadToS3 } = require("../services/s3Services");

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

const uploadProfilePicture = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    if (!req.file) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "File not provided",
      });
    }
    const profilePic = req.file;
    const fileName =
      Date.now() + "-" + profilePic.originalname + user?.fullName;
    const s3Response = await uploadToS3({ file: profilePic, fileName });
    const fileURL = s3Response.Location;
    const updatedUser = await user.update(
      { profilePic: fileURL },
      { transaction: transaction }
    );
    if (!updatedUser) {
      throw new Error(
        "Something went wrong while uploading profile pic, please try again"
      );
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: { userDetails: updatedUser },
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { profile, editProfile, uploadProfilePicture };
