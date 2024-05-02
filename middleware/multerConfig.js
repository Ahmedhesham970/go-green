const multer = require("multer");
const ApiError = require("../utils/ApiError");
const validationResult = require("../utils/validationRules");
const apiError = require("../utils/ApiError");
const cloudinary=require("../utils/cloudinaryConfig")
const express = require("express");
const router=express.Router()



const storage = multer.memoryStorage();

const fileFilter = (req, file, cb, next) => {
  const imgType = file.mimetype.split("/")[0];
  if (imgType != "image") {
    return cb(new ApiError("Only Images allowed", 400), false);
  } else {
    return cb(null, true);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const uploadFile = (fieldName) => async(req, res, next) => {
  // Handle multer file upload
  upload.single(fieldName)(req,res, async (file,err) => {
    if (err) {
      return next(new ApiError(err.message, 400));
    }

    // If multer upload is successful, proceed to Cloudinary upload
    try {
      // If multer upload is successful, proceed to Cloudinary upload
  let cloudinaryResult= cloudinary.uploader.upload_stream(req.files.buffer)
   console.log({cloudinaryResult})
          next();
    } catch (error) {
      // If Cloudinary upload fails, return error
      console.error(`Cloudinary error: \n ${error}`);
      return next(new ApiError(`Failed to upload file to Cloudinary${error}`, 400));
    }
  });
};

module.exports = uploadFile;
