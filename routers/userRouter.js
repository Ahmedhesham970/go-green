const express = require("express");
const router = express.Router();
const user = require("../controllers/authController");
const password = require("../controllers/passwordConfigrations");
const apiError = require("../utils/ApiError");
const authRole = require("../middleware/AuthRole");
const {
  AddingUserValidation,
  changeUserPasswordValidator,
  LoginValidator,
} = require("../utils/validationRules");
const uploadFile = require("../middleware/multerConfig");
const { validationResult } = require("express-validator");
const authorized = require("../middleware/verifyToken");
const uploadUserProfileImage = uploadFile("profileImage");

router
  .route("/register")
  .post(uploadUserProfileImage, AddingUserValidation, user.createUser);
// Verify Email Route
router.post("/verifyemail", user.verifyEmail);
// Login Route
router.route("/login").post(LoginValidator, user.logIn);

router.put("/:id/follow", authorized.auth, user.follow);
router.put("/:id/unfollow", authorized.auth, user.unfollow);

router
  .route("/changePassword/:id")
  .put(changeUserPasswordValidator, password.changePassword);
router.post("/forgetpassword", password.forgetPassword);
router.post("/verifypassword", password.verifyPasswordResetCode);
router.put("/setnewpassword", password.setNewPassword);
router.route("/allusers").get(authorized.auth, authRole(), user.allUsers);

module.exports = router;
