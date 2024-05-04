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
const cloudinary= require("cloudinary").v2;


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
let profileImage=req.file.buffer.toLocaleString()
  // 3. Hash the password
  const saltRounds = 8;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 4. Check if image exists in request
  // if (!req.file) {
  //   return res.status(400).send("Please upload a profile image");
  // }

  // 5. Get the uploaded image path
   



  // 6. Create a new user object
  const newUser = new user({
    name,
    email,
    password: hashedPassword,
    confirmPassword,
    phone,
    profileImage: profileImage,
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

  const payload = createPayload.createToken({
    role: newUser.role,
    id: newUser.id,
    name: newUser.name,
    google_id: newUser.google_id
  });

  // 8. Save the user and send response
 await newUser.save();

 return res.status(201).json(
  { message: "Registration successful" ,
  user:{"email":newUser.email,"name":newUser.name,"role":newUser.role},
  token:payload
  });
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

  
    // Reset passwordResetVerified flag to null

    // Save the updated user data
    await loggedIn.save();

    const payload = createPayload.createToken({
      role: loggedIn.role,
      id: loggedIn.id,
    });
    // console.log(payload);
    return res.status(200).send({
      message: "Logged in successfully",
      user: { name: loggedIn.name, email: loggedIn.email, role: loggedIn.role },
      token: payload,
    });
  
});

