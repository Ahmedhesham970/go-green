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
const apiError = require("./utils/ApiError");
app.use(morgan("dev"));

app.use("/api/user", userRouter);

app.all("*", (req, res, next) => {
  // const err = new Error);
  next(new apiError(`cannot access ${req.originalUrl}`));
});
app.use(globalError);

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