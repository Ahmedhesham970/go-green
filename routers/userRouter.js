const express = require("express");
const router = express.Router();
const authToken = require("../middleware/verifyToken");
const user = require("../controllers/userController");
const auth = require("../controllers/authController");
const password = require("../controllers/passwordConfigrations");
const upload = require("../middleware/multer");
const apiError = require("../utils/ApiError");
const ApiError = require("../utils/ApiError");
const cloudinary = require("../utils/cloudinaryConfig");
const stream = require("stream");
const uploadImage = require("../middleware/uploadImage");
const passport = require("passport");
const googleAuth = require("../middleware/googleAuth");
const authRole = require("../middleware/AuthRole");
const {
  AddingUserValidation,
  changeUserPasswordValidator,
  LoginValidator,
} = require("../utils/validationRules");
const uploadFile = require("../middleware/multerConfig");
const { validationResult } = require("express-validator");
const authorized = require("../middleware/verifyToken");
require("../middleware/googleAuth");
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    // Handle successful authentication

    const payload = authToken.createToken({
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      id: req.user.google_id,
    });

    res.status(200).json({
      message: "logging in successful",
      user: { email: req.user.email, name: req.user.name, role: req.user.role },
      token: payload,
    });
  }
);
// upload.single("profileImage"),uploadImage,
router.post("/register",upload.single("profileImage"),auth.createUser);
router.patch(
  "/update",
  authorized.auth,
  upload.single("profileImage"),
  uploadImage,
  user.updateProfile
);
router.route("/login").post(LoginValidator, auth.logIn);
router.post("/verifyemail", auth.verifyEmail);
router.put("/:id/follow", authorized.auth, user.follow);
router.put("/:id/unfollow", authorized.auth, user.unfollow);
router.get("/profile", authorized.auth, user.showProfile);
router
  .route("/changePassword/:id")
  .put(changeUserPasswordValidator, password.changePassword);
router.post("/forgetpassword",password.forgetPassword);
router.post("/verifypassword", password.verifyPasswordResetCode);
router.put("/setnewpassword",password.setNewPassword);
router.route("/allusers").get(authorized.auth, authRole(), user.allUsers );

module.exports = router;
