const multer = require("multer");
const ApiError = require("../utils/ApiError");
const validationResult = require("../utils/validationRules");
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
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).send({ error: err });
    }

    next();
  });
};
module.exports = uploadFile;
