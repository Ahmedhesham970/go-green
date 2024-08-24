const express = require("express");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv").config();
const { error } = require("console");
const app = express();

const globalError = require("./middleware/errorMiddleware");
app.use(express.json());
const database = require("./dataBase/dataBase");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const userRouter = require("./routers/userRouter");
const postRouter = require("./routers/postRouter");
const machineRouter = require("./routers/machineRouter");
const passport = require("passport");
const articleRouter = require("./routers/articlesRouter");
const apiError = require("./utils/ApiError");
require("./middleware/googleAuth");
app.use(morgan("dev"));
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/article", articleRouter);
app.use("/api/machine",machineRouter);
app.use(
  session({
    secret: process.env.COOKIE_SESSION_KEY || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.all("*", (req, res, next, err) => {
  // const err = new Error);
  next(new apiError(`cannot access ${req.originalUrl} : ${err.message} `));
});
app.use(globalError);

app.get("/", (req, res) => {
  res.status(200).json("welcome to the server GoGreen!!");
});

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
// process.on("unhandledRejection", (err) => {
//   console.error(`Unhandled promise rejection${err}`);
//   server.close(() => {
//     console.error("shutting down............");
//     process.exit(1);
//   });
// });
