const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async function (options) {
  try {
    // 1) Create transporter and send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL, 
        pass: process.env.MAILER_PASSWORD, 
      },
    });

    // 2) Define how the message should be sent
    const emailOptions = {
      from: "GoGreen <noreply@gogreen.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3) Send the email
    await transporter.sendMail(emailOptions); // Ensure to await sending email
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err; // Rethrow the error to be handled by the caller
  }
};

module.exports = sendEmail;
