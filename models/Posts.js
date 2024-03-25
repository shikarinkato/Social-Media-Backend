import mongoose from "mongoose";

const PostSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    posts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        postCaption: { type: String },
        img: {
          type: String,
        },
        interactions: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Interactions",
        },
      },
    ],
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", PostSchema);
export default Posts;
