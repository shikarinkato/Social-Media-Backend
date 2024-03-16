import express from "express";
import { Auth } from "../middlewares/Auth.js";
import {
  CreatePost,
  DeletePost,
  GetGlobalPosts,
  GetUserPosts,
} from "../controllers/Posts.js";

const router = express.Router();

router.put("/add", Auth, CreatePost);
router.get("/global", GetGlobalPosts);
router.get("/user/:userId", GetUserPosts);
router.delete("/:postId", Auth, DeletePost);

export default router;
