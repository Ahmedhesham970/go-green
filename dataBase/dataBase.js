const { error } = require("console");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();
dotenv.config({ path: "config.env" });
mongoose.connect(process.env.DB_URL).then((conn) => {
  console.log("Connected to the database successfully", conn.connection.host);
})
.catch((error) => {
  console.error(`error in connect with database${error}`);
});
