const mongoose = require("mongoose");
const Schema = mongoose.Schema; // You need to import Schema from mongoose

const postSchema = new Schema({
  caption: {
    type: String,
  },
  postDate: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      comment: {
        type: String,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  publisher: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: {
    type: [String],
    min: 1,
  },
});

module.exports = mongoose.model("Post", postSchema);
