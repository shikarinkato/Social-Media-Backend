import express from "express";
import { AddComment, ChangeLikes } from "../controllers/Interactions.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.put("/like", Auth, ChangeLikes);
router.put("/comment", Auth, AddComment);


export default router;