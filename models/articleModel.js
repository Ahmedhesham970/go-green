const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
 source:{
  id: { type: String, required: true }, 
  name: { type: String } 
 },
 author: { type: String }, 
  title: {
    type: String,
    required: true,
  },
  articleImage: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url:{
    type :String ,
    unique :true
  },
  publishedAt: {
    type: Date,
    default: Date.now() + 10 * 60 * 1000,
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("article", articleSchema);
