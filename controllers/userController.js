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
const post = require("../models/postModel");
const { emailMessage } = require("../utils/emailVerficationMessage");
const { profile } = require("console");
// const { post } = require("../routers/userRouter");
const createPayload = require("../middleware/verifyToken");

require("dotenv").config();

// @desc    Show the users
// @route   GET /api/users/allusers
// Access   Public
exports.allUsers = asyncHandler(async (req, res, next) => {
  const findAll = user
    .find()
    .select("-__v -password")
    .then((data) => {
      res.status(200).json({ success: true, count: data.length, data });
    });
});
// @desc    follow the users
// @route   POST /api/follow
// Access   Public
exports.follow = asyncHandler(async (req, res, next) => {
  const User = await user.findById(req.user.id);
  const userWhoFollowed = await user.findById(req.params.id);
  console.log({ "id from params": userWhoFollowed.id });

  if (User.id === userWhoFollowed.id) {
    throw new apiError("You cannot follow yourself", 405);
  }
  if (User.following.includes(userWhoFollowed.id)) {
    throw new apiError(
      `You have already followed ${userWhoFollowed.name}`,
      400
    );
  }

  try {
    await User.updateOne({ $push: { following: userWhoFollowed } });
    await userWhoFollowed.updateOne({ $push: { followers: User } });

    return res.json({
      success: true,
      message: `You are now following ${userWhoFollowed.name}`,
    });
  } catch (e) {
    throw new apiError(e.message);
  }
});
/// @desc    unfollow the users
// @route   PUT /api/user/:id/like
// Access   Protected
exports.unfollow = asyncHandler(async (req, res, next) => {
  const User = await user.findById(req.user.id);
  console.log("user following :", User.following);
  const userUnFollowed = await user.findById(req.params.id);
  if (req.user.id == req.params.id) {
    throw new apiError("You cannot unfollow yourself", 405);
  }
  if (!User.following.includes(userUnFollowed.id)) {
    throw new apiError(`You have not follow ${userUnFollowed.name}`, 400);
  }
  await User.updateOne({ $pull: { following: userUnFollowed.id } });
  await userUnFollowed.updateOne({ $pull: { followers: User.id } });

  return res.json({
    success: true,
    message: `You unfollow ${userUnFollowed.name}`,
  });
});

// //@desc create POST
// //@route POST /api/user/POST/create
// //Access protected
// const createPOST = asyncHandler(async (req, res) => {
//   //check if user already exists and registered
//   if (!req.user){
//     return new apiError('You must be logged in',401)
//   }

//   const images = req.file.path;
//   const caption = req.body.caption;
// // set the parameters for the time and date of the post
//   var date = new Date();
//   var day = date.toDateString();
//   var time = date.toLocaleTimeString();

//   const timeAndDate = day + " " + time;
//   console.log(timeAndDate);
//   const post = await POST.create({
//     caption: caption,
//     images: images,
//     createdAt: timeAndDate,
//   });

//   return res.status(200).send({
//     message: "new post !",
//     post,
//   });
// });

exports.showProfile = asyncHandler(async (req, res, next) => {
  try {
    const User = req.user;
    const userProfile = await user
      .findById(User.id)
      .populate("following")
      .select("-role -__v -_id -password -email -emailVerified -createdAt  ");

    const following = userProfile.following.length;
    const followers = userProfile.followers.length;
    const posts = userProfile.posts.length;
    const data = res.status(200).json({
      message: "success",
      data: {
        followers,
        following,
        posts,
        name: userProfile.name,
        image: userProfile.profileImage,
      },
    });
  } catch (error) {
    throw new apiError(error, 500);
  }
});

exports.updateProfile = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    let profileImage = req.file.buffer.toString();
    const updatedUser = await user.findByIdAndUpdate(
      req.user.id,
      { name, profileImage }, // Update name and profileImage fields
      { new: true, runValidators: true }
    );
    const payload = createPayload.createToken({
      name: updatedUser.name,
      id: updatedUser.id,
    });
    res.send({
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      payload,
    });
  } catch (err) {
    throw new apiError(err.message, 400);
  }
});
