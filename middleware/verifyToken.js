const express = require("express");
const app= express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const user = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/ApiError");
require("dotenv").config();

//token creation
 exports.createToken = (payload) =>
  jwt.sign( payload , process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });



exports.auth = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header, prioritizing case-insensitive handling
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader.split(" ")[1]; // Use optional chaining to handle missing headers

  if (!token) {
    // Handle missing token
    return next(new apiError("Authorization header missing", 401));
  }

  try {
    // Verify the token using environment-stored secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach decoded user information to request object for convenience (optional)
   req.user = decoded;
   req.decoded = decoded;
  //  console.log(decoded);
    next(); // Continue processing the request if token is valid
  } catch (error) {
    // Handle token validation errors (expired, invalid)
    if (error instanceof jwt.TokenExpiredError) {
      return next(new apiError("Token has expired", 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(new apiError(error, 401));
    } else {
      // Pass other errors (e.g., network errors) for further handling
      return next(error);
    }
  }
});
