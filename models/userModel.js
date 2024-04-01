const mongoose = require("mongoose");
const db = require("../dataBase/dataBase");
const post =require('./postModel')
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
    },
    profileImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      match: [
        /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
        "Password must have at least one uppercase letter and one special character",
      ],
    },
    governorate: {
      type: String,
      enum: [
        "Alexandria",
        "Aswan",
        "Asyut",
        "Beheira",
        "Beni Suef",
        "Cairo",
        "Dakahlia",
        "Damietta",
        "Fayoum",
        "Gharbeya",
        "Giza",
        "Ismailia",
        "Kafr El Sheikh",
        "Luxor",
        "Matruh",
        "Minya",
        "Monufia",
        "New Valley",
        "North Sinai",
        "Port Said",
        "Qalyubia",
        "Qena",
        "Red Sea",
        "Suez",
        "Sohag",
        "South Sinai",
        "Sweida",
      ],
    },
    bio: {
      type: String,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: [true, "Phone number must be unique"],
    },
    //email configurations
    emailRandomKey: {
      type: String,
    },
    emailHashedKey: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
    },
    emailVerifyExpiresIn: {
      type: Date,
    },
    following: [{ type: mongoose.Types.ObjectId, ref: "User", default: 0 }],
    followers: [{ type: mongoose.Types.ObjectId, ref: "User", default: 0 }],
    posts: [{ type: mongoose.Types.ObjectId, ref:'post', default:""}],
    //password configurations
    passwordRandomKey: {
      type: String,
    },
    passwordHashedKey: {
      type: String,
    },
    passwordResetVerified: {
      type: Boolean,
    },
    passwordResetExpiresIn: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timeStamps: true }
);

const user = mongoose.model("User", userSchema);

module.exports = user;
