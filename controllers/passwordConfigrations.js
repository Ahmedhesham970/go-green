const user = require("../models/userModel");
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const apiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendMail");
const token = require("../middleware/verifyToken");
require("dotenv").config();

exports.changePassword = asyncHandler(async (req, res, next) => {
  const change = await user.findByIdAndUpdate(
    req.params.id,
    { currentPassword: bcrypt.hash(req.body.currentPassword, 8) },
    { new: true }
  );
  if (!change) {
    return next(new ApiError(`there is no user with id ${req.params.id}`));
  }
  res
    .status(200)
    .send({ msg: "updated successfully", change: change.password });
});

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // 1) check if the user exists in the database
  const User = await user.findById(req.user.id);
  const mail= User.email
   
  if (!mail) {
    return next(
      new apiError(
        `Could not find ${User.email} please enter a valid email`,
        404
      )
    );
  } 
  //  2) generate a random reset random key
  const passwordRandomKey = Math.floor(1000 + Math.random() * 9000).toString();

  const saltRounds = 8; // Adjust as needed
  const passwordHashedKey = await bcrypt.hash(passwordRandomKey, saltRounds);
  User.passwordHashedKey = passwordHashedKey;

  const passwordResetExpiresIn = new Date(Date.now() + 10 * 60 * 1000);
  User.passwordResetExpiresIn = passwordResetExpiresIn;
  // FindEmail.passwordResetExpiresIn = false;
  // Save the user
  await User.save();

  try {
    await sendEmail({
      name: User.name,
      email: User.email,
      subject: `Hi ${User.name}
      your password has been updated`,
      message: `Dear ${User.name},

We have received a request to reset the password for your account. \n If you did not make this request, please disregard this email \n

Your unique reset code is:  ${passwordRandomKey} \n 

Please note that this reset code is only valid for the next 10 minutes \n

If you have any questions or concerns, please contact us `,
    });

    // Assuming you're sending the email successfully, you can handle the success case here
    // For example, you might want to send a success response to the client or redirect them to a success page.
    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
    });
  } catch (err) {
    // Assuming you're using Express, you can use `next` to pass the error to the error-handling middleware.
    next(new apiError(err.message, 500));
  }
});

exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const checkPassword = req.body.resetCode; // Assuming the reset code is in the 'resetCode' field

  const checkReset = await user.findOne({
    passwordResetExpiresIn: { $gt: Date.now() },
  });
  const hashedResetCode = await bcrypt.compare(
    checkPassword,
    checkReset.passwordHashedKey
  );

  if (!checkReset || !hashedResetCode) {
    return next(new apiError("Invalid reset code or expired", 400));
  }
  // Update the 'randomResetVerified' field to true
  checkReset.passwordResetVerified = true;
  await checkReset.save(); // Save the changes to the database

  res.status(200).json({
    success: true,
    message: "Password reset code is valid.",
  });
});

exports.setNewPassword = asyncHandler(async (req, res, next) => {
  const User = await user.findOne({ email: req.user.email });

  if (!User) {
    return next(
      new apiError(`There is no user with email ${req.user.email}`, 404)
    );
  }

  if (User.passwordResetVerified === false) {
    return next(
      new apiError(
        "The reset code is not verified yet, please check your email and try again",
        403
      )
    );
  }

  const confirmPassword = req.body.confirmPassword;
  if (confirmPassword !== req.body.newPassword) {
    return next(new apiError("The passwords do not match", 400));
  }

  try {
    User.password = req.body.newPassword;
    const salt = await bcrypt.genSalt(10);
    User.password = await bcrypt.hash(User.password, salt);

    // Clear unnecessary fields
    User.passwordResetExpiresIn = null;
    User.passwordRandomKey = null;
    User.passwordHashedKey = null;
    User.passwordResetVerified = null;

    // Save the updated user to the database
    await User.save();

    // Create and send a new token
    const payload = await token.createToken({
      userId: User.email,
    });

    res.status(200).json({
      success: true,
      message: "verified \n Your account has been verified successfully ",
      token: payload,
    });
  } catch (error) {
    return next(new apiError("Error setting a new password", 500));
  }
});
