const nodemailer = require("nodemailer");
const express = require("express");
const user = require("../controllers/authController");
const { options } = require("../routers/userRouter");
require("dotenv").config();

const sendEmail = async (options) => {
  try {
    // 1) Create transporter and send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // upgrade later with STARTTLS and attach certs.
      auth: {
        user: "googreen2024@gmail.com",
        pass: "lepv acbn gsbn zpcm",
        //
        //
      },
    });

    // 2) define how the message should be sent
    const emailOptions = {
      from: "GoGreen <noreply@gogreen.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    // 3) send the email
    transporter.sendMail(emailOptions);
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = sendEmail;
