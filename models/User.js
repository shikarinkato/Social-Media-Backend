import mongoose from "mongoose";
const UserSchema = mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: { type: String, required: true, minLength: 5, select: false },
  pic: { type: String },
  bio: { type: String, required: false },
  followers: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      pic: { type: String },
    },
  ],
  followings: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      pic: { type: String },
    },
  ],
  userPosts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
