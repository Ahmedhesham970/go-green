const express = require("express");
const router = express.Router();
const apiError = require("../utils/ApiError");
const uploadFile = require("../middleware/multerConfig");
const uploadImage = uploadFile("articleImage");
const authRole = require("../middleware/AuthRole");
const article = require("../controllers/articleController");
const auth = require("../middleware/verifyToken");

router.get("/articles", article.allArticles);
router.post(
  "/addarticle",
  auth.auth,
  authRole(),
  uploadImage,
  article.addArticle
);
router.get("/:id", article.getSingleArticle);

module.exports = router;
