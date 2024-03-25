import mongoose from "mongoose";

const InteractionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [
    {
      byUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      byUser: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: { type: String },
        pic: { type: String },
      },
      comment: {
        type: String,
      },
    },
  ],
});
const Interactions = mongoose.model("interaction", InteractionSchema);

export default Interactions;
