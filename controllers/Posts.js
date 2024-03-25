import Interactions from "../models/Interactions.js";
import Posts from "../models/Posts.js";
import User from "../models/User.js";

export const CreatePost = async (req, res) => {
  let user = req.user;
  let { img, interactions, postCaption } = req.body;
  try {
    if (!interactions) {
      res
        .status(502)
        .json({ message: "Required fields not Found", success: false });
      return;
    } else {
      let updatedInteractions;

      let post = await Posts.findOne({ user: user._id });
      if (post === null || post.posts.length <= 0) {
        updatedInteractions = {
          user: user._id,
          likes: interactions.likes,
          comments: interactions.comment,
        };

        interactions = await Interactions.create(updatedInteractions);
        if (interactions) {
          post = await Posts.create({
            user: user._id,
            posts: [
              {
                userId: user._id,
                postCaption,
                img,
                interactions: interactions._id,
              },
            ],
          });

          res
            .status(200)
            .json({ message: "Post Created Succefully", success: true });

          user = await User.findByIdAndUpdate(user._id, {
            userPosts: post._id,
          });
        } else {
          res.status(500).json({
            message: "Seems like There's something wrong in Universe",
            success: false,
          });
        }
      } else {
        updatedInteractions = {
          user: user._id,
          likes: interactions.likes,
          comments: [],
        };
        interactions = await Interactions.create(updatedInteractions);
        if (interactions) {
          post = await Posts.findByIdAndUpdate(post._id, {
            $push: {
              posts: {
                userId: user._id,
                postCaption,
                img,
                interactions: interactions._id,
              },
            },
          });
          res
            .status(200)
            .json({ message: "Post Created Succefully", success: true });
        } else {
          res.status(500).json({
            message: "Seems like There's something wrong in Universe",
            success: false,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const GetGlobalPosts = async (req, res) => {
  try {
    let allPosts = await Posts.find().populate("posts").exec();
    let totalPosts = [];
    if (allPosts.length > 0) {
      if (totalPosts.length <= 0) {
        for (let i = 0; i < allPosts.length; i++) {
          for (let j = 0; j < allPosts[i].posts.length; j++) {
            let post = allPosts[i].posts[j];
            totalPosts.push(post);
          }
        }
        totalPosts = await Promise.all(
          totalPosts.map(async (post, idx) => {
            let user = await User.findById(post.userId);
            return {
              user: {
                pic: user.pic,
                userName: user.userName,
                userId: user._id,
              },
              img: post.img,
              interactions: await Interactions.findById(post.interactions),
              postCaption: post.postCaption,
              _id: post._id,
            };
          })
        );

        res.status(200).json({ totalPosts, success: true });
      } else {
        res.status(404).json({ message: "There's no posts", success: false });
      }
    } else {
      res.status(404).json({ message: "There's no posts", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
};

export const GetUserPosts = async (req, res) => {
  let { userId } = req.params;
  try {
    if (!userId) {
      res.status(404).json({ message: "User id not found", success: false });
      return;
    }

    let posts = await Posts.findOne({ user: userId }).populate("posts").exec();

    if (posts && posts.posts.length > 0) {
      let interactions;
      let updatedPostsArr = [];
      for (let i = 0; i < posts.posts.length; i++) {
        interactions = await Interactions.findById(posts.posts[i].interactions);
        let user = await User.findById(posts.posts[i].userId);
        updatedPostsArr.push({
          user: { userId: user._id, userName: user.userName, pic: user.pic },
          img: posts.posts[i].img,
          interactions,
          postCaption: posts.posts[i].postCaption,
          _id: posts.posts[i]._id,
        });
      }
      res.status(200).json({ updatedPostsArr, success: true });
    } else {
      if (!posts) {
        let updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $unset: { userPosts: "" },
          },
          { new: true }
        );
        res.status(404).json({
          message: "No Posts found with specific User ID",
          success: false,
        });
      } else {
        res.status(404).json({
          message: "No Posts found with specific User ID",
          success: false,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
};

export const DeletePost = async (req, res) => {
  let user = req.user;
  let { postId } = req.params;
  try {
    if (!postId) {
      res
        .status(400)
        .json({ message: "Required fields Missing", success: false });
    } else {
      let post = await Posts.findOneAndUpdate(
        { user: user._id },
        { $pull: { posts: { _id: postId } } },
        { new: true }
      );
      if (post) {
        res
          .status(204)
          .json({ message: "Post Deleted Successfully", success: true });
      } else {
        res.status(404).json({ message: "Post not found", success: false });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: true });
    console.log(error);
  }
};
