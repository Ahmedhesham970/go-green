const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const user = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/ApiError");
const auth = require("../middleware/verifyToken");
const sendEmail = require("../utils/sendMail");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const createPayload = require("../middleware/verifyToken");
const { emailMessage } = require("../utils/emailVerficationMessage");

require("dotenv").config();

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });
//@desc create user and send the verification code
//@route POST /api/user/register
//Access public
exports.createUser = asyncHandler(async (req, res, next) => {
  // 1. Extract request body data
  const { name, email, phone, role, governorate } = req.body;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  // 2. Validate password confirmation
  if (password !== confirmPassword) {
    return next(new apiError("Invalid password confirmation.", 400));
  }

  // 3. Hash the password
  const saltRounds = 8;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 4. Check if image exists in request
  // if (!req.file) {
  //   return res.status(400).send("Please upload a profile image");
  // }

  // 5. Get the uploaded image path
  const profileImage = req.file.path;

  // 6. Create a new user object
  const newUser = new user({
    name,
    email,
    password: hashedPassword,
    confirmPassword,
    phone,
    profileImage,
    role,
    governorate,
  });

  // 7. Check for existing user
  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      throw new ApiError("This user already exists", 409);
    }
  } catch (error) {
    return next(error);
  }

  // 8. Save the user and send response
  try {
    newUser.emailVerified == false;
    const emailRandomKey = Math.floor(1000 + Math.random() * 9000).toString();
    newUser.emailRandomKey = emailRandomKey;
    const saltRounds = 8;

    const emailHashedKey = await bcrypt.hash(emailRandomKey, saltRounds);
    newUser.emailHashedKey = emailHashedKey;
    const emailVerifyExpiresIn = new Date(Date.now() + 10 * 60 * 1000);
    newUser.emailVerifyExpiresIn = emailVerifyExpiresIn;
    const userName = newUser.name;
    const userEmail = newUser.email;
    const verificationCode = emailRandomKey;
    if ((newUser.emailVerified = false)) {
      return new apiError("you must verify your email first", 400);
    }
    try {
      await sendEmail({
        name: newUser.name,
        email: newUser.email,
        subject: `Hi ${newUser.name}, This is a verification Code for Your Account`,
        message: `
      Dear ${newUser.name},

      You are receiving this email because you requested to verify your account with GoGreen. Please use the following verification code to complete the process:

      Verification Code: ${verificationCode}

      If you did not request this verification, please ignore this email. Thank you for using GoGreen.

      Best regards,
      GoGreen Team
    `,
      });

      await newUser.save();

      return res.status(201).send({ message: "Registration successful" });
    } catch (err) {
      // Assuming you're using Express, you can use `next` to pass the error to the error-handling middleware.
      console.error("Error sending email:", err.message);
      next(new apiError(`error in sending code${err}`, 500));
    }

    await newUser.save();
    return res.status(201).send({ message: "Registration successful" });

    // const payload = createToken({
    //   newUser: {
    //     name: newUser.name,
    //     pic: `${process.env.ORIGINAL_URL}${profileImage}`, //ORIGINAL_URL is a base URL

    //   email: savedUser.email,
    //   role: savedUser.role,
    // });
    // console.log("token", payload);
  } catch (error) {
    return next(error); // Forward the error to central error handler
  }
});

// @desc  verify the registration
// @route POST /api/verifyemail
//Access public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const checkCode = req.body.verificationCode;

  const User = await user.findOne({
    emailVerifyExpiresIn: { $gt: Date.now() },
  });

  if (!User) {
    return next(new apiError("Expired verification code", 400));
  }
  const saltRounds = 8;
  const emailHashKey = await bcrypt.hash(checkCode, saltRounds);
  const emailHashedKey = await bcrypt.compare(
    emailHashKey,
    User.emailHashedKey
  );
  if (!emailHashKey) {
    return next(new apiError("Invalid verification code", 400));
  }

  const payload = await createToken({
    email: User.email,
    role: User.role,
  });
  // console.log("token", payload);
  res.status(201).send({
    message: "Your account has been verified successfully!",
    token: payload,
  });

  User.emailRandomKey = null;
  User.emailHashedKey = undefined;
  User.emailVerifyExpiresIn = undefined;
  User.emailVerified = true;
  await User.save();
});

// @desc    Login User
// @route   POST /api/login
// Access   Public
exports.logIn = asyncHandler(async (req, res, next) => {
  const loggedIn = await user.findOne({ email: req.body.email });

  if (!loggedIn) {
    return next(new apiError("user login failed ,please try again later", 400));
  }

  // const checkPassword = await bcrypt.compare(
  //   req.body.password,
  //   loggedIn.password
  // );

  // if (!checkPassword) {
  //   return next(new apiError("user login failed ,please try again later", 400));
  // }

  if (loggedIn.emailVerified != true) {
    return next(
      new apiError(
        "Your account email has not been verified yet. Please check your email inbox for the verification code. If you did not receive the email, please check your spam folder or request a new verification email.",
        403
      )
    );
  } else {
    // Reset passwordResetVerified flag to null

    // Save the updated user data
    await loggedIn.save();

    const payload = createPayload.createToken({
      role: loggedIn.role,
      id: loggedIn.id,
    });
    // console.log(payload);
    return res.status(200).send({
      message: "Logged In Successfully!",
      token: payload,
    });
  }
});
