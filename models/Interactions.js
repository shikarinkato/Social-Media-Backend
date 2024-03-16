import mongoose from "mongoose";

const InteractionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: {
    type: Number,
  },
  comments: [
    {
      byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: {
        type: String,
      },
    },
  ],
});
const Interactions = mongoose.model("interaction", InteractionSchema);

export default Interactions;
