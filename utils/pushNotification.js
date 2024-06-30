const express = require("express");
const admin = require("firebase-admin");
const asyncHandler = require("express-async-handler");
const User= require("../models/userModel")

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
  }),
  databaseURL:
    "https://console.firebase.google.com/u/0/project/eloquent-glow-406021/firestore/databases/-default-/data/~2F",
});


const payload = {
  notification: {
    title: "FCM IS COOL !",
    body: "Notification has been received",
    content_available: "true",
    image:
      "https://1.bp.blogspot.com/-DBDAGu-Zdvw/WM6SK--fNoI/AAAAAAAAAb8/DKEGkzivagw77_T7qu32O2KmskXjcH_KACLcB/s1600/Go-Green_logo.png",
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
