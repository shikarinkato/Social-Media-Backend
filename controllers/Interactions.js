import Interactions from "../models/Interactions.js";
import Posts from "../models/Posts.js";
import User from "../models/User.js";

export const ChangeLikes = async (req, res) => {
  let { action, postId, userId, byUser } = req.body;
  try {
    if (!action || !postId || !userId || !byUser) {
      res
        .status(404)
        .json({ message: "Required fileds are Missing", success: false });
      return;
    } else {
      byUser = await User.findById(byUser);
      if (byUser) {
        let user = await User.findById(userId);
        if (user) {
          let posts = await Posts.findById(user.userPosts);
          if (posts) {
            if (posts.posts.length > 0) {
              let actualPost = posts.posts.filter(
                (item) => item._id.toString() === postId
              );
              if (actualPost.length > 0) {
                let interactions = await Interactions.findById(
                  actualPost[0].interactions
                );

                if (action === "add") {
                  let isIncludeLike = interactions.likes.some(
                    (item) => item.byUser.toString() === byUser._id.toString(0)
                  );
                  if (isIncludeLike) {
                    res
                      .status(200)
                      .json({ message: "Already Liked", succes: true });
                  } else {
                    let interactions = await Interactions.findByIdAndUpdate(
                      actualPost[0].interactions,
                      {
                        $push: {
                          likes: { byUser: byUser._id },
                        },
                      }
                    );
                    res.status(200).json({ message: "Liked", success: true });
                  }
                } else if (action === "remove") {
                  let interactions = await Interactions.findById(
                    actualPost[0].interactions
                  );
                  if (interactions.likes.length >= 0) {
                    let isIncludeLike = interactions.likes.some(
                      (item) =>
                        item.byUser.toString() === byUser._id.toString(0)
                    );
                    if (isIncludeLike) {
                      interactions = await Interactions.findByIdAndUpdate(
                        actualPost[0].interactions,
                        {
                          $pull: {
                            likes: { byUser: byUser._id },
                          },
                        }
                      );
                      res
                        .status(200)
                        .json({ message: "Unliked", success: true });
                    } else {
                      res
                        .status(400)
                        .json({ message: "User not liked", succes: false });
                    }
                  } else {
                    res.status(500).json({
                      message: "You have Taken wrong Action",
                      success: false,
                    });
                  }
                } else {
                  res.status(2).json({
                    message: "Action is not Specified",
                    succes: false,
                  });
                }
              } else {
                res
                  .status(404)
                  .json({ message: "Post not found", success: false });
              }
            } else {
              res
                .status(404)
                .json({ message: "User have 0 Posts", success: false });
            }
          } else {
            res
              .status(404)
              .json({ message: "Posts not Found", success: false });
          }
        } else {
          res.status(404).json({ message: "User not Found", success: false });
        }
      } else {
        res
          .status(404)
          .json({ message: "Another User not Found", succes: false });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
};

export const AddComment = async (req, res) => {
  let { comment, postId, userId, anotherUser } = req.body;
  try {
    if (!comment || !postId || !userId || !anotherUser) {
      res
        .status(404)
        .json({ message: "Required fileds are Missing", success: false });
      return;
    } else {
      let user = await User.findById(userId);
      if (user) {
        let posts = await Posts.findById(user.userPosts);
        if (posts.posts.length > 0) {
          let actualPost = posts.posts.filter(
            (item) => item._id.toString() === postId
          );
          if (actualPost.length > 0) {
            anotherUser = await User.findById(anotherUser);
            console.log(anotherUser)
            let interactions = await Interactions.findByIdAndUpdate(
              actualPost[0].interactions,
              {
                $push: {
                  comments: {
                    byUser: {
                      _id: anotherUser._id,
                      userName: anotherUser.userName,
                      pic: anotherUser.pic,
                    },
                    comment,
                  },
                },
              }
            );
            res
              .status(200)
              .json({ message: "Comment Added Succesfullly", success: true });
          } else {
            res.status(404).json({ message: "Post not found", success: false });
          }
        } else {
          res
            .status(404)
            .json({ message: "User have 0 Posts", success: false });
        }
      } else {
        res.status(404).json({ message: "User not Found", success: false });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
};

// export const GetComments = async (req, res) => {
//   let { comment, postId, userId, anotherUser } = req.body;
//   try {
//     if (!comment || !postId || !userId || !anotherUser) {
//       res
//         .status(404)
//         .json({ message: "Required fileds are Missing", success: false });
//       return;
//     } else {
//       let user = await User.findById(userId);
//       if (user) {
//         let posts = await Posts.findById(user.userPosts);
//         if (posts.posts.length > 0) {
//           let actualPost = posts.posts.filter(
//             (item) => item._id.toString() === postId
//           );
//           if (actualPost.length > 0) {
//             let interactions = await Interactions.findByIdAndUpdate(
//               actualPost[0].interactions,
//               {
//                 $push: {
//                   comments: { byUser: anotherUser, comment },
//                 },
//               }
//             );
//             res
//               .status(200)
//               .json({ message: "Comment Added Succesfullly", success: true });
//           } else {
//             res.status(404).json({ message: "Post not found", success: false });
//           }
//         } else {
//           res
//             .status(404)
//             .json({ message: "User have 0 Posts", success: false });
//         }
//       } else {
//         res.status(404).json({ message: "User not Found", success: false });
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error", success: false });
//     console.log(error);
//   }
// };
