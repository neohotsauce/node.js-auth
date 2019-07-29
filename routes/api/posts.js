const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { catchErr, customErr } = require("../../middleware/helpers");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Posts");

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route  GET api/posts
// @desc   Get all posts
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    return res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route  GET api/posts/:id
// @desc   Get post by id
// @access Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ errors: [{ msg: "Post not found" }] });
    }

    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ errors: [{ msg: "Post not found" }] });
    }

    return res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete a post
// @access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ errors: [{ msg: "Post not found" }] });
    }
    //check user
    if (post.user.toString() !== req.user.id) {
      return res.status(400).json({ errors: [{ msg: "User not authorized" }] });
    }
    const removedPost = await post.remove();
    const userPosts = await Post.find({ user: req.user.id });

    res.json({ removedPost, userPosts });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ errors: [{ msg: "Post not found" }] });
    }
    return res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    //check if post has been liked by the user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ errors: [{ msg: "Post already liked" }] });
    }

    post.likes.unshift({ user: req.user.id });
    post = await post.save();
    res.json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ errors: [{ msg: "Post not found" }] });
    }
    return res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unike a post
// @access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    //check if post has been liked by the user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return customErr("Post has not yet been liked", res);
    }

    post.likes = await post.likes.filter(like => {
      return like.user.toString() !== req.user.id;
    });
    post = await post.save();
    res.json(post.likes);
  } catch (err) {
    catchErr(err, res);
  }
});

// @route  POST api/posts/comment/:id
// @desc   Create a comment on post
// @access Private
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      let post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      post = await post.save();

      res.json(post.comments);
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route  DELETE api/posts/comment/:post_id/:comment_id
// @desc   Delete a comment on post
// @access Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    //check if post exists
    if (!post) {
      return customErr("Post not found", res);
    }

    //check if the comment exists
    const comment = post.comments.find(item => {
      return item.id === req.params.comment_id;
    });
    if (!comment) {
      return customErr("Comment not found", res);
    }

    //check if its the correct user
    if (comment.user != req.user.id) {
      return customErr("User not authorized", res);
    }

    post.comments = await post.comments.filter(item => {
      return item.id !== req.params.comment_id.toString();
    });

    post.save();
    res.json(post.comments);
  } catch (err) {
    catchErr(err, res);
  }
});

module.exports = router;
