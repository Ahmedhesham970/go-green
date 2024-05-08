const express = require("express");
const router = express.Router();
const apiError = require("../utils/ApiError");
const uploadFile = require("../middleware/multerConfig");
const authRole = require("../middleware/AuthRole");
const post = require("../controllers/postController");
const auth = require("../middleware/verifyToken");
const ApiError = require("../utils/ApiError");
const cloudinary = require("../utils/cloudinaryConfig");
const stream = require("stream");
const upload = require("../middleware/multer");
const uploadImage = require("../middleware/uploadPostImage");






router.post("/new", auth.auth, upload.single("images"),uploadImage, post.createPost);
router.put(
  "/:id/update",
  auth.auth,
  upload.single("images"),
  uploadImage,
  post.updatePost
);
router.patch("/:id/like", auth.auth,post.likePost)
router.get("/:id", auth.auth,post.getPost);
router.get("/user/feed", auth.auth, post.getFeed);
router.get("/user/:id", auth.auth,post.getAllPostsForUser);
router.patch("/user/comment/:id", auth.auth,post.writeComment);
router.get("/user/comment/:id", auth.auth,post.getAllComments);

module.exports = router;
