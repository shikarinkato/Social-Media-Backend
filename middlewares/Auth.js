import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function Auth(req, res, next) {
  let token = req.headers.authorization || req.headers.Authorization;
  try {
    if (token) {
      token = token.split(" ")[1];
      if (token) {
        let userId = await jwt.decode(token, process.env.SECRET_KEY);
        if (userId) {
          let user = await User.findOne({ userId });
          if (user) {
            req.user = user;
          } else {
            res.status(404).json({
              message: "User not found please create an Account",
              success: false,
            });
            return;
          }
          next();
        } else {
          res.status(403).json({
            message: "Token is undefined",
            success: false,
          });
          return;
        }
      } else {
        res.status(403).json({
          message: "Token id Invalid",
          success: false,
        });
        return;
      }
    } else {
      res.status(404).json({
        message: "Token is Missing",
        success: false,
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
    console.log(error);
    return;
  }
}
