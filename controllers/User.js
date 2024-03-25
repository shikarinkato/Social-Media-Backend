import bcryptjs from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Posts from "../models/Posts.js";
import Interactions from "../models/Interactions.js";

export const AddNewUser = async (req, res) => {
  const uid = uuidV4();
  let { userName, name, email, password, pic, bio } = req.body;

  try {
    if (!name || !email || !password || !userName) {
      res
        .status(502)
        .json({ message: "Required fields not found", success: false });
      return;
    } else {
      let user = await User.findOne({ email });

      if (user) {
        res
          .status(401)
          .json({ message: "User already Exists", success: false });
        return;
      } else {
        let isuserName = await User.findOne({ userName });
        console.log(isuserName);
        if (isuserName) {
          res
            .status(502)
            .json({ message: "username already exists", success: false });
          return;
        } else {
          let hashedPass = await bcryptjs.hash(password, 10);
          user = await User.create({
            userId: uid,
            userName,
            name,
            email,
            password: hashedPass,
            pic,
            bio,
            followers: [],
            followings: [],
            posts: [],
          });
          res.status(200).json({
            message: "Registered Succesfully",
            user: {
              userId: uid,
              userName,
              email,
            },
            success: true,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
    console.log(error);
  }
};

export async function Login(req, res) {
  let { emailOrusername, password } = req.body;
  try {
    if (!emailOrusername || !password) {
      res
        .status(502)
        .json({ message: "Required fields not found", success: false });
      return;
    } else {
      let user = await User.findOne({
        $or: [{ email: emailOrusername }, { userName: emailOrusername }],
      }).select("+password");
      if (!user) {
        res.status(404).json({ message: "User not Found", success: true });
        return;
      } else {
        let isMatched = await bcryptjs.compare(password, user.password);
        if (isMatched) {
          let token = await jwt.sign(user.userId, process.env.SECRET_KEY);
          user = await User.findById(user._id).select("-password");

          res.status(200).json({
            message: `Welcome back ${user.name}`,
            user,
            token,
            success: true,
          });
          return;
        } else {
          res
            .status(403)
            .json({ message: "Invalid Credentials", success: false });
          return;
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
    console.log(error);
  }
}

export async function GetUser(req, res) {
  let user = req.user;
  try {
    res.status(200).json({ user, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
    console.log(error);
  }
}

export async function UpdateUser(req, res) {
  let user = req.user;
  let { updatedUser } = req.body;
  try {
    if (
      !updatedUser ||
      !updatedUser.userName ||
      !updatedUser.name ||
      !updatedUser.email ||
      !updatedUser.pic ||
      !updatedUser.bio
    ) {
      res
        .status(502)
        .json({ message: "Required fields not Found", success: false });
      return;
    }

    user = await User.findByIdAndUpdate(
      user._id,
      {
        userName: updatedUser.userName,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
        bio: updatedUser.bio,
        followers: updatedUser.followers,
        followings: updatedUser.followings,
        userPosts: updatedUser.userPosts,
      },
      { new: true }
    );

    if (user) {
      res
        .status(200)
        .json({ message: "User Updated Successfully", user, success: true });
    } else {
      res.status(404).json({ message: "User not found", success: true });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
    console.log(error);
  }
}

export async function ChangeFollowing(req, res) {
  let user = req.user;
  let { anotherUser, action, pic } = req.body;
  try {
    if (anotherUser === user._id.toString()) {
      res.status(403).json({
        message: "Seems like your mind isn't at right place",
        success: false,
      });
    } else {
      if (!anotherUser || !action || !pic) {
        res
          .status(404)
          .json({ message: "Required fields are Missing", success: false });
        return;
      }
      if (action === "add") {
        const userExistsInFollowings = await User.findOne(
          { _id: user._id },
          { followings: { $elemMatch: { id: anotherUser } } }
        );
        if (
          !userExistsInFollowings ||
          userExistsInFollowings.followings.length === 0
        ) {
          anotherUser = await User.findById(anotherUser);
          if (anotherUser) {
            let updatedUser = await User.findByIdAndUpdate(user._id, {
              $push: { followings: { id: anotherUser, pic } },
            });
            if (updatedUser) {
              anotherUser = await User.findByIdAndUpdate(anotherUser, {
                $push: { followers: { id: user._id, pic: user.pic } },
              });
              if (anotherUser) {
                res.status(200).json({
                  message: "Added To followings",
                  success: true,
                });
              } else {
                updatedUser = await User.findByIdAndUpdate(user._id, {
                  $pull: { followings: { id: anotherUser } },
                });
                res.status(400).json({
                  message: "Oops I think he/she is too stubborn",
                  success: false,
                });
              }
            } else {
              res.status(400).json({
                message: "Oops I think he/she is too stubborn",
                success: false,
              });
            }
          } else {
            res.status(404).json({
              message: "Requested User ain't exists",
              success: false,
            });
          }
        } else {
          res.status(400).json({
            message: "User Already exists in followings",
            success: false,
          });
        }
      } else if (action === "remove") {
        const userExistsInFollowings = await User.findOne(
          { _id: user._id },
          { followings: { $elemMatch: { id: anotherUser } } }
        );

        if (userExistsInFollowings) {
          let updatedUser = await User.findByIdAndUpdate(user._id, {
            $pull: { followings: { id: anotherUser } },
          });

          if (updatedUser) {
            const userExistsInFollowers = await User.findOne({
              _id: anotherUser,
              "followers.id": user._id,
            });

            if (userExistsInFollowers) {
              let updatedAnotherUser = await User.findByIdAndUpdate(
                anotherUser,
                {
                  $pull: { followers: { id: user._id } },
                }
              );

              if (updatedAnotherUser) {
                res.status(200).json({
                  message: "Removed from followings",
                  success: true,
                });
              } else {
                res.status(400).json({
                  message: "Failed to update another user",
                  success: false,
                });
              }
            } else {
              res.status(400).json({
                message: "User not found in followers",
                success: false,
              });
            }
          } else {
            res.status(400).json({
              message: "Failed to update user",
              success: false,
            });
          }
        } else {
          res.status(400).json({
            message: "User not found in followings",
            success: false,
          });
        }
      } else {
        res.status(400).json({
          message: "Requested process can't Complete right now",
          success: false,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error ", success: false });
    console.log(error);
  }
}

export async function RemoveFollower(req, res) {
  let user = req.user;
  let { anotherUser } = req.body;
  try {
    if (anotherUser === user._id.toString()) {
      res.status(403).json({
        message: "Seems like your mind isn't at right place",
        success: false,
      });
      return;
    } else {
      if (!anotherUser) {
        res
          .status(404)
          .json({ message: "Required fields are Missing", success: false });
        return;
      } else {
        if (user.followers.length > 0) {
          const followerExists = user.followers.find(
            (follower) => follower.id.toString() === anotherUser
          );
          if (!followerExists) {
            res.status(400).json({
              message: "Requested User ain't exists in Follower's list",
              success: false,
            });
            return;
          } else {
            anotherUser = await User.findById(anotherUser);
            if (anotherUser) {
              let updatedUser = await User.findByIdAndUpdate(user._id, {
                $pull: { followers: { id: anotherUser._id } },
              });
              if (updatedUser) {
                anotherUser = await User.findByIdAndUpdate(anotherUser, {
                  $pull: { followings: { id: user._id } },
                });
                if (!anotherUser) {
                  updatedUser = await User.findByIdAndUpdate(user._id, {
                    $push: { followers: { id: anotherUser._id } },
                  });
                  res.status(500).json({
                    message: "Failed to update Another User",
                    success: false,
                  });
                  return;
                } else {
                  res.status(204).json({
                    message: "Follower Removed Succesfully",
                    success: true,
                  });
                  return;
                }
              } else {
                res.status(500).json({
                  message: "Sorry failed to Remove User",
                  success: false,
                });
                return;
              }
            } else {
              res.status(404).json({
                message: "Requested User ain't exists",
                success: false,
              });
              return;
            }
          }
        } else {
          res.status(404).json({
            message: "User's follower list is empty",
            success: false,
          });
          return;
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
}

export async function SearchUser(req, res) {
  let query = req.query;
  try {
    if (!query.user) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let searchedUsers = await User.find({
        $or: [
          { userName: { $regex: query.user, $options: "i" } },
          { name: { $regex: query.user, $options: "i" } },
        ],
      });
      if (searchedUsers.length > 0) {
        res.json({
          message: "User fetched Succesfully",
          searchedUsers,
          success: true,
        });
      } else {
        res.json({
          message: "No user found",
          success: false,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
}

export async function GetSearchedUser(req, res) {
  let query = req.query;
  try {
    if (!query.id) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let searchedUser = await User.findById(query.id);
      if (searchedUser) {
        let posts = await Posts.findById(searchedUser.userPosts);
        if (posts && posts.posts.length > 0) {
          let interactions;
          let updatedPostsArr = [];
          for (let i = 0; i < posts.posts.length; i++) {
            interactions = await Interactions.findById(
              posts.posts[i].interactions
            );
            updatedPostsArr.push({
              userId: posts.posts[i].userId,
              img: posts.posts[i].img,
              interactions,
              _id: posts.posts[i]._id,
            });
          }
          searchedUser = {
            _id: searchedUser._id,
            userId: searchedUser.userId,
            userName: searchedUser.userName,
            name: searchedUser.name,
            email: searchedUser.email,
            pic: searchedUser.pic,
            bio: searchedUser.bio,
            followers: searchedUser.followers,
            followings: searchedUser.followings,
            userPosts: updatedPostsArr,
          };
          res.status(200).json({ searchedUser, success: true });
        } else {
          res.status(200).json({ searchedUser, success: true });
        }
      } else {
        res.json({
          message: "No user found",
          success: false,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
}
