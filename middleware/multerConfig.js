const multer = require("multer");
const ApiError = require("../utils/ApiError");
const validationResult = require("../utils/validationRules");
const apiError = require("../utils/ApiError");
const cloudinary=require("../utils/cloudinaryConfig")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
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

const uploadFile = (fieldName) => (req, res, next) => {
  // Handle multer file upload
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return next(new ApiError(err.message, 400));
    }

    // If multer upload is successful, proceed to Cloudinary upload
    cloudinary.uploader.upload(req.file.path, (cloudErr, result) => {
      if (cloudErr) {
        // If Cloudinary upload fails, return error
        return next(new ApiError(cloudErr.message, 400));
      }

      // If Cloudinary upload is successful, attach Cloudinary URL to request object
      req.cloudinaryUrl = result.secure_url;

      // Proceed to the next middleware
      next();
    });
  });
};

module.exports = uploadFile;
