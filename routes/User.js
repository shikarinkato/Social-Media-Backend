import express from "express";
import {
  AddNewUser,
  ChangeFollowing,
  GetSearchedUser,
  GetUser,
  Login,
  RemoveFollower,
  SearchUser,
  UpdateUser,
} from "../controllers/User.js";
import { Auth } from "../middlewares/Auth.js";
const router = express.Router();

router.post("/add", AddNewUser);
router.post("/login", Login);
router.route("/profile").get(Auth, GetUser).put(Auth, UpdateUser);
router.put("/followings", Auth, ChangeFollowing);
router.put("/followers", Auth, RemoveFollower);
router.get("/search", SearchUser);
router.get("/search/get", GetSearchedUser);

export default router;
