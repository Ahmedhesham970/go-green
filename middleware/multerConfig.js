const multer = require("multer");
const ApiError = require("../utils/ApiError");
const validationResult = require("../utils/validationRules");
const apiError = require("../utils/ApiError");
const cloudinary=require("../utils/cloudinaryConfig")
const express = require("express");
const router=express.Router()



const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const picExtension = file.mimetype.split("/")[1];
    const picName = `user-${Date.now()}.${picExtension}`;
    // req.file.profileImage = picName;
    cb(null, picName);
  },
});

const fileFilter = (req, file, cb, next) => {
  const imgType = file.mimetype.split("/")[0];
  if (imgType != "image") {
    return cb(new ApiError("Only Images allowed", 400), false);
  } else {
    return cb(null, true);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });



module.exports = upload;
