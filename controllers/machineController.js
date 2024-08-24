const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const POST = require("../models/postModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/ApiError");
const auth = require("../middleware/verifyToken");
const sendEmail = require("../utils/sendMail");
const User = require("../models/userModel");
const path = require("path");
const { timeStamp } = require("console");
const user = require("../models/userModel");
const { options } = require("../routers/userRouter");
const Machine = require("../models/recycleMachineModel");
require("dotenv").config();

exports.findNearbyMachine = asyncHandler(async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const coordinates = [longitude, latitude];
    const nearbyMachine = await Machine.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates,
          },
          distanceField: "distance",
          maxDistance: 900,
          spherical: true,
          key: "location",
        },
      },
    ]);
    const result = nearbyMachine.map((item) => {
      return {
        name: item.name,
        location: item.location.coordinates,
        distance: item.distance.toPrecision(4) + " meters",
      };
    });
    res.json(result);
  } catch (err) {
    throw new apiError(err);
  }
});

exports.addNewMachine = asyncHandler(async(req, res, next)=>{
 try{ const {name,location} = req.body;
  const newMachine = await Machine.create({
    name: name,
    location: location
  })
  await newMachine.save()
  return res.status(201).json({status:'success',message:`new machine created successfully and it's coordinates are ${newMachine.location.coordinates}!`})
}catch(e) {
  throw new apiError(error,400)
}
})