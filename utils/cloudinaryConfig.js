const express = require('express');
const multer = require('multer');
const mongoose=require('mongoose');
const cloudinary = require("cloudinary").v2
require("dotenv").config();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_key,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary