const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  caption: {
    type: String,
  },
  postDate: {
    type: Date,
    default: Date.now,
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
    required: false,
  },
});

module.exports = mongoose.model("Post", postSchema);
