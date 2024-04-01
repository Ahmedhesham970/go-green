const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const user = require("../models/userModel");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const ApiError = require("../utils/ApiError");
const article = require("../models/articleModel");
const apiError = require("../utils/ApiError");

exports.allArticles = asyncHandler(async (req, res, next) => {
  const Articles = await article
    .find()
    .populate("author")
    .select("-__v")
    .select("-_id");
  if (!Articles) {
    return new apiError("No articles found", 404);
  }
  res.status(200).json({
    success: true,
    "number of articles": Articles.length,
    articles: Articles,
  });
});

// @desc      Get single article by id
// @route     GET /api/v1/articles/:id
// @access    Public
exports.getSingleArticle = asyncHandler(async (req, res, next) => {
  const Article = await article
    .findById(req.params.id)
    .populate("author")
    .select("-__v")
    .select("-_id");

  //Check if article exists
  if (!Article) {
    return next(new ApiError("Article not found", 404));
  }

  //Return response
  res.status(200).json({
    success: true,
    article: Article.source,
    author: Article.author,
    title: Article.title,
    description: Article.description,
    publishedAt: Article.publishedAt,
    content: Article.content,
    imageUrl: `${process.env.ORIGINAL_URL}${Article.articleImage}`,
  });
});
//@desc       Add an article
//@route      POST /api/v1/articles
//@access     Private
exports.addArticle = asyncHandler(async (req, res, next) => {
  const articleImage = req.file.path;
  const {
    source: { id, name },
    author,
    description,
    url,
    content,
    title,
  } = req.body;
  //Create the article object
  const articleObject = new article({
    source: {
      id: id,
      name: name,
    },
    author,
    description,
    articleImage: `${process.env.ORIGINAL_URL}${articleImage}`,
    url,
    title,
    content,
  });

  //Save the article to database
  const createdArticle = await articleObject.save();

  //Respond to request
  res.status(201).json({
    success: true,
    data: createdArticle,
  });
});

