const express = require("express");
const multer = require("multer");
const upload = require("../middleware/multer");
const apiError = require("../utils/ApiError");
const ApiError = require("../utils/ApiError");
const cloudinary = require("../utils/cloudinaryConfig");
const stream = require("stream");

const uploadImage = async (req, res, next) => {
  try {
    // Ensure there is a file in the request
    if (!req.file) {
      throw new ApiError("No file uploaded.");
    }

    let profileImage = req.file.buffer; // Directly use the buffer
    const cloudinaryResult = await cloudinary.uploader.upload_stream(
      {},
      (error, result) => {
        if (error) {
          return new ApiError(error.message);
        } else {
          console.log("Upload successful:", result.secure_url);
          req.file.buffer = result.secure_url;
          next();
        }
      }
    );

    // Create a stream and pipe the buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "posts",
        quality: "auto:best",
      },
      (error, result) => {
        if (error) {
          throw error;
        } else {
          console.log("Upload successful:", result.secure_url);
          req.file.buffer = result.secure_url; // Store the URL, not the buffer
          next();
        }
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(profileImage);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    console.error(`Cloudinary error: \n ${error}`);
    return next(
      new ApiError(`Failed to upload file to Cloudinary ${error}`, 400)
    );
  }
};
module.exports = uploadImage;
