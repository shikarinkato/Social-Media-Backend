import { config } from "dotenv";
import express from "express";
import UserRouter from "./routes/User.js";
import PostRouter from "./routes/Posts.js";
import cors from "cors";
export const app = express();

config({
  path: "./data/config.env",
});

app.use(express.json());
console.log(process.env.FRONTEND_URL)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome lavdya",
    success: true,
  });
});

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/posts", PostRouter);
