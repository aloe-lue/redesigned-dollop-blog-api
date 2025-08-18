import asyncHandler from "express-async-handler";
import db from "../prisma/query/index.js";
import {
  query,
  body,
  param,
  validationResult,
  header,
} from "express-validator";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { jwtDecode } from "jwt-decode";
import UserExistError from "../errors/userExistError.js";
import PostDoesNotExistError from "../errors/postDoesNotExistError.js";
import CommentDoesNotExistError from "../errors/commentDoesNotExistError.js";
import UserDoesNotExistError from "../errors/userDoesNotExistError.js";

const emptyField = "should not be empty.";
const contentLength = "should be between 3 and 600 characters.";
const contentAlphanumeric = "should be a alphanumeric.";
const contentString = "should be a string";
const userIdLength = "should be exactly 25 characters.";

const commentAuthenticationVC = [
  header("authorization")
    .trim()
    .notEmpty()
    .withMessage(`authorization ${emptyField}`),
];

const commentAuthentication = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  let userRole;

  if (!errors.isEmpty) {
    return res.status(404).json({
      commentAuthenticationValidationError: errors.array(),
    });
  }

  const headerField = "authorization";
  const reqHeader = req.headers[headerField];

  // this could go awry but passport use or passport authenticate know it
  if (typeof reqHeader !== undefined) {
    const bearerToken = req.headers["authorization"].split(" ")[1];

    // get jwt payload using jwt-decode dependency
    const decodedJwt = jwtDecode(bearerToken);

    if (!decodedJwt) {
      throw new JwtDecodeError("jwt is not valid");
    }

    // role checks for making member or author comments
    const user = await db.user.getUserById(decodedJwt.userId);
    // make sure to find that such user exist
    if (!user) {
      throw new UserExistError("there is no user.");
    }

    // prisma findunique returns user.author = {} or user.member = null
    if (user.member == null) {
      userRole = "author";
    } else {
      userRole = "member";
    }
  }

  const jwtStrategyOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:
      userRole === "member"
        ? process.env.MEMBER_JWT_SECRET
        : process.env.AUTHOR_JWT_SECRET,
  };

  const jwtCbFunction = async (jwtPayload, done) => {
    // get user by id again because we can't access what's inside the passport use jwtCbFunction but is it possible?
    const user = await db.user.getUserById(jwtPayload.userId);
    if (!user) {
      return done(null, false, { message: "Invalid user" });
    }
    return done(null, { userId: jwtPayload.userId });
  };
  passport.use(new JwtStrategy(jwtStrategyOpts, jwtCbFunction));

  // this time don't next but instead add the comment
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    // unauthenticated
    if (error) {
      return res.status(401).json({
        message: info.message,
      });
    }
    // user is forbidden
    if (!user) {
      return res.status(403).json({
        message: info.message,
      });
    }

    // allow user to do operation
    next();
  })(req, res, next);
});

const postIdString = "should be a string.";
const postIdAlphaNumeric = "should be alphanumeric.";
const postIdLength = "should be exactly 25 characters";

const commentSetterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`postId ${emptyField}`)
    .isString()
    .withMessage(`postId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`postId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`postId ${postIdLength}`),
  body("commentContent")
    .trim()
    .notEmpty()
    .withMessage(`content ${emptyField}`)
    .isString()
    .withMessage(`content ${contentString}`)
    .isLength({ max: 600, min: 3 })
    .withMessage(`content ${contentLength}`),
  body("commentUserId")
    .trim()
    .notEmpty()
    .withMessage(`UserId ${emptyField}`)
    .isAlphanumeric()
    .withMessage(`UserId ${contentAlphanumeric}`)
    .isLength({ max: 25, max: 25 })
    .withMessage(`UserId ${userIdLength}`),
];

const commentSetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      addCommentValidationError: errors.array(),
    });
  }

  const { postId } = req.params;
  // to make sure that there is a post
  const post = await db.post.getPost(postId);
  if (!post) {
    throw new PostDoesNotExistError("post doesn't exist");
  }

  const { commentUserId, commentContent } = req.body;
  const data = {
    userId: commentUserId,
    content: commentContent,
    postId: postId,
    dateCreated: new Date(),
  };

  // handle prisma throw error using additional query
  const user = await db.user.getUserById(commentUserId);
  if (!user) {
    throw new UserDoesNotExistError("User does not exist.");
  }

  // add comment to post
  await db.comment.addComment(data);
  res.json({ message: "comment added" });
});

// middleware chains for adding a comment
const postCommentAdder = [
  commentAuthenticationVC,
  commentAuthentication,
  commentSetterVc,
  commentSetter,
];

const pageNumeric = "should be numeric.";

const postCommentsGetterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`postId ${emptyField}`)
    .isString()
    .withMessage(`postId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`post ${postIdAlphaNumeric}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`postId ${postIdLength}`),
  query("skip")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(`skip ${emptyField}`)
    .isNumeric()
    .withMessage(`skip ${pageNumeric}`),
];

const postCommentsGetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      getCommentsValidationError: errors.array(),
    });
  }

  const { postId } = req.params;
  // check for post existence
  const post = await db.post.getPost(postId);
  if (!post) {
    throw new PostDoesNotExistError("post doesn't exist.");
  }

  const { skip } = req.query;
  const intSafeLimit = Number.MAX_SAFE_INTEGER;
  let data;
  let numberSkip = Number(skip) || 0;

  // offset pagination < cursor pagination
  if (numberSkip >= 1 && numberSkip < intSafeLimit) {
    // in this case skip the like 5
    data = await db.comment.getCommentsOffsets(postId, numberSkip);
  } else {
    // take 5
    data = await db.comment.getComments(postId);
  }

  // give data
  res.json(data);
});

const postComments = [postCommentsGetterVc, postCommentsGetter];

const postCommentGetterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`postId ${emptyField}`)
    .isString()
    .withMessage(`postId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`postId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`postId ${postIdLength}`),
  param("commentId")
    .trim()
    .notEmpty()
    .withMessage(`commentId ${emptyField}`)
    .isString()
    .withMessage(`commentId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`commentId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`commentId ${postIdLength}`),
];

const postCommentGetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  // show errors of the validation
  if (!errors.isEmpty()) {
    return res.status(400).json({
      postCommentGetterValidationError: errors.array(),
    });
  }
  // check for a thing or two existence
  const { postId, commentId } = req.params;

  // it should throw a good error unlike delete or update db request they are strict but it's good that it's like that.
  const data = await db.comment.getCommentByIdAndPost(postId, commentId);
  if (!data) {
    throw new CommentDoesNotExistError("Comment does not exist.");
  }

  res.json({
    data,
  });
});

// get single comment from post
const postComment = [postCommentGetterVc, postCommentGetter];

const postCommentUpdaterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`postId ${emptyField}`)
    .isString()
    .withMessage(`postId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`postId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`postId ${postIdLength}`),
  param("commentId")
    .trim()
    .notEmpty()
    .withMessage(`commentId ${emptyField}`)
    .isString()
    .withMessage(`commentId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`commentId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`commentId ${postIdLength}`),
  body("commentContent")
    .trim()
    .notEmpty()
    .withMessage(`content ${emptyField}`)
    .isString()
    .withMessage(`content ${contentString}`)
    .isLength({ min: 3, max: 600 })
    .withMessage(`content ${contentLength}`),
];

const postCommentUpdater = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      commentUpdaterValidationError: errors.array(),
    });
  }

  const { postId, commentId } = req.params;

  const postComment = await db.comment.getCommentByIdAndPost(postId, commentId);

  // make sure that post comment exist to do risky operation
  // this is to not throw prisma error
  if (!postComment) {
    throw new CommentDoesNotExistError("comment can not be found.");
  }

  const { commentContent } = req.body;

  const data = {
    id: commentId,
    content: commentContent,
    dateUpdated: new Date(),
  };

  // update the commentContent with the data above
  await db.comment.updateComment(data);
  res.json({ message: "comment updated!" });
});

// middlwares to update a comment
const postCommentPutter = [
  commentAuthenticationVC,
  commentAuthentication,
  postCommentUpdaterVc,
  postCommentUpdater,
];

const postCommentDeleterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`postId ${emptyField}`)
    .isString()
    .withMessage(`postId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`postId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`postId ${postIdLength}`),
  param("commentId")
    .trim()
    .notEmpty()
    .withMessage(`commentId ${emptyField}`)
    .isString()
    .withMessage(`commentId ${postIdString}`)
    .isAlphanumeric()
    .withMessage(`commentId ${postIdAlphaNumeric}`)
    .isLength({ min: 25, max: 25 })
    .withMessage(`commentId ${postIdLength}`),
];

const postCommentDeleter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      postCommentDeleterValidationError: errors.array(),
    });
  }

  const { postId, commentId } = req.params;
  // find first the comment and post if both exist or either exist
  const postComment = await db.comment.getCommentByIdAndPost(postId, commentId);

  if (!postComment) {
    throw new CommentDoesNotExistError("comment does not exist.");
  }

  // do a delete operation on comment from post
  await db.comment.deleteComment(commentId);

  // redirecting a request is dangerous go and find ways to counter this
  // post id is dangerous be careful of this
  // res.redirect(`/post/${postId}`);
  res.json({ message: "comment deleted!" });
});

const postCommentRemoval = [postCommentDeleterVc, postCommentDeleter];

export default {
  getPostComments: postComments,
  getPostComment: postComment,
  setPostComment: postCommentAdder,
  updatePostComment: postCommentPutter,
  deletePostComment: postCommentRemoval,
};
