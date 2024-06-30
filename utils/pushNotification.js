const express = require("express");
const admin = require("firebase-admin");
const asyncHandler = require("express-async-handler");
const User= require("../models/userModel")
const serviceAccount = require("../utils/eloquent-glow-406021-firebase-adminsdk-wkgoe-a9789d9ada.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://console.firebase.google.com/u/0/project/eloquent-glow-406021/firestore/databases/-default-/data/~2F",
});


const payload = {
  notification: {
    title: "FCM IS COOL !",
    body: "Notification has been received",
    content_available: "true",
    image: "https://i.ytimg.com/vi/iosNuIdQoy8/maxresdefault.jpg",
  },
};

const options = {
  priority: "high",
};

exports.sendNotification = asyncHandler(async (req, res, next) => {
  const userId = req.user
  const userRecord =await User.findById(userId);
  const registrationToken=req.headers.authorization.split(' ')[1]
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then(function (response) {
      res.send({message:"message successfully sent !",data:payload});
    })
    .catch(function (error) {
      res.send(error).status(500);
    });
});
