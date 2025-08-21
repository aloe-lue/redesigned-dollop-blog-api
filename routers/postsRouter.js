import { Router } from "express";
import controller from "../controllers/indexController.js";

const { getPost, getPosts, setPost, updatePost, deletePost, getAuthorPosts } =
  controller.posts;
const {
  getPostComments,
  getPostComment,
  setPostComment,
  updatePostComment,
  deletePostComment,
} = controller.comment;

const postsRouter = Router();

// get posts
postsRouter.get("/", getPosts);

// get author posts
postsRouter.get("/:userId", getAuthorPosts);

// get single post
postsRouter.get("/:postId", getPost);

// add single post
postsRouter.post("/", setPost);

// update single post
postsRouter.put("/:postId", updatePost);

// delete single post
postsRouter.delete("/:postId", deletePost);

// get comments
postsRouter.get("/:postId/comments", getPostComments);

// get comment from a post
postsRouter.get("/:postId/comments/:commentId", getPostComment);

// add a comment to a post
postsRouter.post("/:postId/comments", setPostComment);

// update a comment from a post
postsRouter.put("/:postId/comments/:commentId", updatePostComment);

// delete a comment from a post
postsRouter.delete("/:postId/comments/:commentId", deletePostComment);

export default postsRouter;
