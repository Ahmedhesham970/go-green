const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/ApiError");
const authToken = require("../middleware/verifyToken");
const passport = require("passport");
const google = require("passport-google-oauth20");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
var crypto = require("crypto");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL:
        "https://go-green-3w65.onrender.com/api/user/auth/google/callback",
      passReqToCallback: true,
      scope: ["profile", "email", "offline_access"],
    },
    async function (
      request,
      response,
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      // Log the profile information to the console
      // console.log("Email:", profile.emails[0].value);
      // console.log("Name:", profile.displayName);
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const profileImageURL = profile.photos[0].value;
      // console.log(profile);
      // console.log("Access Token:", accessToken);
      // console.log("Refresh Token:", refreshToken);

      // Passing the user profile to the done callback
      let random =
        (Math.random() + 2).toString(36).substring(7).toUpperCase() +
        process.env.GOOGLE_PASSWORD_COMPILATION;
      const user = await User.findOne({ google_id: profile.id });

      //  newUser.emailVerified = true;
      if (!user) {
        const newUser = await User.create({
          email: email,
          name: name,
          google_id: profile.id,
          profileImage: profileImageURL,
          password: random,
        });

        await newUser.save();
        const payload = authToken.createToken({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          id: newUser.google_id,
        });
        // return payload

        console.log("new user token :", payload);
      } else {
        const payload = authToken.createToken({
          email: user.email,
          name: user.name,
          role: user.role,
          id: user.google_id,
        });

        console.log("existing user token :", payload);
        //  return payload
        // return res.status(400).send("\n \n user already exists! \n \n ");
      }

      done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ google_id: id });
    done(null, user);
  } catch (error) {
    console.error("Error in deserializing user:", error);
    done(error, null);
  }
});
