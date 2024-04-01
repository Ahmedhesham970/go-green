const { check, body } = require("express-validator");
const validationResult = require("../middleware/validation");
const { options } = require("../routers/userRouter");
const user = require("../models/userModel");
const bcrypt = require("bcryptjs");
//---------------------creating validation middleware----------------------//

exports.AddingUserValidation = [
  check("name")
    .notEmpty()
    .withMessage("you must enter a name")
    .isLength({ max: 40 })
    .withMessage("your name is too long"),
  check("email")
    .isEmail()
    .withMessage("you must enter an email address")
    .notEmpty()
    .withMessage("you should enter a valid email address"),
  check("phone")
    .isMobilePhone("ar-EG")
    .withMessage("your phone number should be true ")
    .isLength({ min: 11 })
    .withMessage("the phone number should be 11 characters"),
  check("password").isStrongPassword().withMessage("your password is too weak"),
  validationResult,
];

exports.LoginValidator = [
  check("email")
    .isEmail()
    .withMessage("you should enter a valid email address")
    .notEmpty()
    .withMessage("you must enter an email address"),
  check("password").notEmpty().withMessage("you should enter a valid password"),
  validationResult,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  body("NewPassword")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const change = await user.findByIdAndUpdate(req.params.id);
      if (!change) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        change.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validationResult,
];

//-----------getting validation middleware-----------//

exports.GettingValidation = [
  check("id").isMongoId().withMessage("invalid mongo id"),
  validationResult,
];

exports.UpdatingValidation = [
  check("id").isMongoId().withMessage("invalid mongo id"),
  validationResult,
];

exports.DeletingValidation = [
  check("id").isMongoId().withMessage("invalid mongo id"),
  validationResult,
];
