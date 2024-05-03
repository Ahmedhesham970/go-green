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
    google_id: { type: String },
    profileImage: {
      type: String,
      // default:
      //   "https://www.bing.com/images/search?view=detailV2&ccid=mP1RB8xu&id=ACC717494762E9BF88EF1A028CDAA43B2CBAC7FF&thid=OIP.mP1RB8xuQaHAvUkonYY6HwHaHK&mediaurl=https%3a%2f%2fwww.pngall.com%2fwp-content%2fuploads%2f5%2fUser-Profile-PNG.png&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.98fd5107cc6e41a1c0bd49289d863a1f%3frik%3d%252f8e6LDuk2owCGg%26pid%3dImgRaw%26r%3d0&exph=812&expw=840&q=userprofile&simid=608015495525840768&FORM=IRPRST&ck=FDAD693058582A6FFDEE8580B4065C2F&selectedIndex=11&itb=1&ajaxhist=0&ajaxserp=0",
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
      // required: [true, "Phone number is required"],
      // unique: [true, "Phone number must be unique"],
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
    posts: [{ type: mongoose.Types.ObjectId, ref: "Post", default: "" }],
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
