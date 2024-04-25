const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const POST = require("../models/postModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/ApiError");
const auth = require("../middleware/verifyToken");
const sendEmail = require("../utils/sendMail");
const User = require("../models/userModel");
const path = require("path");
require("dotenv").config();

//@desc  Create a new post
//@route POST /api/post/newpost
//Access Protected
exports.createPost = asyncHandler(async (req, res, next) => {
  try {
    const { caption } = req.body;
    // console.log(req.user);
    const publisher = req.user.id;
    const imagePath = req.file.path;
    const images = `${process.env.ORIGINAL_URL}${imagePath}`;
    const user = await User.findById(req.user.id);
    // console.log(user);
    var date = new Date();
    var day = date.toDateString();
    var time = date.toLocaleTimeString();

    const timeAndDate = day + " " + time;
    const post = await POST.create({
      publisher: publisher,
      caption: caption,
      images,
      createdAt: timeAndDate,
    });

    // console.log(population);

    if (!images) {
      throw new apiError(
        "Please upload at least one image to publish the post",
        400
      );
    }

    await post.save();
    await user.updateOne({ $push: { posts: post._id } });
    let population = await post.populate({
      path: "publisher",
      select: "name -_id",
    });
    res.json({ message: "new post !", post });
  } catch (error) {
    console.error("Error creating post:", error);
    next(new apiError(error, 400));
  }
});

//@desc  Update a new post
//@route POST /api/post/newpost
//Access Protected
exports.updatePost = asyncHandler(async (req, res, next) => {
  // console.log(req.user);
  const post = await POST.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const user = await User.findById(req.user.id);
  if (post.publisher == user.id) {
    const update = await POST.findByIdAndUpdate(
      { _id: req.params.id },
      req.body
    );
    return res
      .status(200)
      .json({ message: "your post has been updated", data: update });
  } else {
    throw new apiError(" You do not have permission to update this post!", 401);
  }
});

// @desc    like and unlike posts
// @route   POST /api/post/:id/like
// Access   Protected
exports.likePost = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const post = await POST.findById(req.params.id);
  // console.log(post);

  const likedIndex = post.likes.indexOf(user.id);
  if (likedIndex !== -1) {
    post.likes.splice(likedIndex, 1);
    await post.save();
    return res.json({
      success: true,
      message: `Un liked!`,
    });
  }

  await post.updateOne({ $push: { likes: user } });

  // await userWhoFollowed.updateOne({ $push: { followers: User } });

  return res.json({
    success: true,
    message: `liked !`,
  });
});

// @desc    show a single post
// @route   GET /api/post/:id
// Access   Protected
exports.getPost = asyncHandler(async (req, res) => {
  try {
    const post = await POST.findById(req.params.id).populate({
      path: "publisher",
      select: "name -_id",
    });
    const likes = post.likes.length;
    if (!post) {
      throw new apiError("There is no post ", 400);
    } else {
      return res.status(200).json({
        message: "success",

        date: post.postDate,
        caption: post.caption,
        images: post.images,
        likes: likes,
        publisher: post.publisher,
      });
    }
  } catch (err) {
    throw new apiError(err.message, 500);
  }
});

// @desc    show a all posts for specific user
// @route   GET /api/post/user/:id
// Access   Protected
exports.getAllPostsForUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({ path: "posts", select: " -_id -publisher -__v " })
    .select(
      "-role -__v -_id -password -email -emailVerified -createdAt -followers -following -google_id  "
    );
  const postMap = user.posts.map((post) => {
    return post;
  });
  if (!user) {
    throw new apiError("There is no user ", 404);
  }
  try {
    if (user.posts.length == 0) {
      throw new apiError("there is no post for this user", 404);
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    throw new apiError(err.message, 400);
  }
});

// @desc    Write a new comment
// @route   PATCH api/post/user/comment/:id
// Access   Protected
exports.writeComment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const post = await POST.findById(req.params.id);
  const commentArray = post.comments;
  const newComment = {
    comment: req.body.comment,
    user: req.user.id,
  };
  commentArray.push(newComment);
  // await post.updateOne({ $push: { comments: newComment } });
  // const writeComment = post.comments.push(req.body)

  await post.save();

  // console.log(post.comments);
  res.json({ message: "new comment added!" });
});

// @desc    Get all comments for a specific post
// @route   GET api/post/user/comment/:id
// Access   Protected
exports.getAllComments = asyncHandler(async (req, res) => {
 
  const post = await POST.findById(req.params.id)
 
  .select("-__v -_id")
    .populate({ path: "comments", select: "-_id" })
    .populate({ path: "publisher", select: "name -_id" })
    .populate({ path: "likes", select: "name -_id" })
    .populate({path: "comments.user",select: "name profileImage -_id"})
    .select({ path: "comments.comment", select: "-id" });
    
   post.pre((comment) => {
      return comment._id;
    });

    // console.warn(commentsMap)
  //  console.log(post.comments);

  // post.comments.populate('user')
  res.send(post);
});
