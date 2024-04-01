const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Post = require("../models/postModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/ApiError");
const auth = require("../middleware/verifyToken");
const sendEmail = require("../utils/sendMail");
const User = require("../models/userModel");
require("dotenv").config();
exports.createPost = asyncHandler(async (req, res, next) => {
  try {
    const { caption } = req.body;
    const publisher = req.user.id;
    const image = req.file; // Correct variable name to image
    const images = image ? [`${process.env.ORIGINAL_URL}${image.path}`] : []; // Wrap the image path in an array if it exists, otherwise use an empty array

    const post = new Post({
      publisher: publisher,
      caption: caption,
      images: images, // Correct variable name to images
    });

    if (images.length === 0) {
      throw new apiError(
        "Please upload at least one image to publish the post",
        400
      );
    }

    await post.save(); // Correctly call post.save()

    res.json({ post: post }); // Use caption instead of post.caption
  } catch (error) {
    console.error("Error creating post:", error);
    next(new apiError(error, 400)); // Pass the error object directly to apiError
  }
});
