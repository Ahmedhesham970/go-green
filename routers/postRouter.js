const express = require("express");
const router = express.Router();
const apiError = require("../utils/ApiError");
const uploadFile = require("../middleware/multerConfig");
const uploadImage = uploadFile("images");
const authRole = require("../middleware/AuthRole");
const post = require("../controllers/postController");
const auth = require("../middleware/verifyToken");

router.post("/newpost", auth.auth, authRole(), uploadImage, post.createPost);

module.exports = router;
