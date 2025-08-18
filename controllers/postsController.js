import asyncHandler from "express-async-handler";
import db from "../prisma/query/index.js";
import { query, param, body, validationResult } from "express-validator";
import passport from "passport";
import jwtConfig from "./passportController.js";
import PostDoesNotExistError from "../errors/postDoesNotExistError.js";
import PostExhaustedError from "../errors/postsExhaustedError.js";

const pageQuery = "should be numeric";

const postsGetterVc = [
  query("page").trim().optional().isNumeric().withMessage(`page ${pageQuery}`),
];

const postsGetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      pageValidationError: errors.array(),
    });
  }

  let posts;
  const { page } = req.query;
  const numberPage = Number(page);

  // maybe you want to implement skip not * 10 together with take if you want?
  // use pagination offset, it was written that it's unscalable so why not use it to small records like this?
  if (numberPage >= 1 && numberPage < Number.MAX_SAFE_INTEGER) {
    // this might break things, so you want to add something that adds as backings
    // page is * 10
    posts = await db.post.getPostsPage(numberPage);
  } else {
    posts = await db.post.getPosts();
  }

  if (!posts || posts.length === 0) {
    throw new PostExhaustedError("nothing here");
  }

  res.json(posts);
});

const posts = [postsGetterVc, postsGetter];

const postEmpty = "should not be left empty.";
const postString = "should be a string.";
const postLength = "should be exactly 25 characters.";
const postAlphaNum = "should be alphanumeric.";

const postGetterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`post ${postEmpty}`)
    .isString()
    .withMessage(`post ${postString}`)
    .isAlphanumeric()
    .withMessage(`post ${postAlphaNum}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`post ${postLength}`),
];

const postGetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      queryError: errors.array(),
    });
  }
  const { postId } = req.params;
  const data = await db.post.getPost(postId);

  if (!data) {
    throw new PostDoesNotExistError("post does not exist");
  }

  res.json({
    data,
  });
});

// get p equal to cuid
// ! do not trust user req[var] where var is body, query, params, etc
// after passing validation chain you want to give the json
const post = [postGetterVc, postGetter];

/****************************************************************************************************************************************** */

// authenticate author jwt token user == author
const authorTokenAuthenticator = asyncHandler(async (req, res, next) => {
  // use the jwt strategy
  passport.use(jwtConfig.jwtStrategyAuthor);
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    if (error) {
      return res.status(401).json({
        message: info.message,
      });
    }
    if (!user) {
      return res.status(403).json({
        message: info.message,
      });
    }
    // go to the next middleware to do db operation or anything else
    next();
  })(req, res, next);
});

const emptyField = "should not be empty.";
const stringChar = "should be string.";
const titleLength = "should be between 2 and 64 characters.";
const minMaxContent = "should be between 500 to 10000 characters.";
const cuidLength = "should be exactly 25 characters";

const postSetterVc = [
  body("postTitle")
    .trim()
    .notEmpty()
    .withMessage(`title ${emptyField}`)
    .isString()
    .withMessage(`title ${stringChar}`)
    .isLength({ min: 2, max: 64 })
    .withMessage(`title ${titleLength}`),
  body("postContent")
    .trim()
    .notEmpty()
    .withMessage(`content ${emptyField}`)
    .isString()
    .withMessage(`content ${stringChar}`)
    .isLength({ min: 500, max: 10000 })
    .withMessage(`content ${minMaxContent}`),
  body("postAuthorId")
    .trim()
    .notEmpty()
    .withMessage(`authorId ${emptyField}`)
    .isString()
    .withMessage(`authorId ${stringChar}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`authorId ${cuidLength}`),
];
const postSetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      postSettervalidationError: errors.array(),
    });
  }

  // req body is destructured within the addPost method using {}
  const bodyReq = req.body;

  const data = {
    authorId: bodyReq.postAuthorId,
    title: bodyReq.postTitle,
    content: bodyReq.postContent,
    dateCreated: new Date(),
    // comment the next later, i use it for testing
    isPublished: false,
  };

  await db.post.addPost(data);
  res.json({ message: "Post created" });
});

// authenticate author jwt token
// go through validation do not trust author, admin, and super admin
// finally when validation is true then adds the post to db
const postAdder = [authorTokenAuthenticator, postSetterVc, postSetter];

/****************************************************************************************************************************************** */

const isPublishedBoolean = "should be boolean.";
const postUpdaterVC = [
  body("postTitle")
    .trim()
    .notEmpty()
    .withMessage(`title ${emptyField}`)
    .isString()
    .withMessage(`title ${stringChar}`)
    .isLength({ min: 10, max: 64 })
    .withMessage(`title ${titleLength}`),
  body("postContent")
    .trim()
    .notEmpty()
    .withMessage(`content ${emptyField}`)
    .isString()
    .withMessage(`content ${stringChar}`)
    .isLength({ min: 500, max: 10000 })
    .withMessage(`content ${minMaxContent}`),
  body("postAuthorId")
    .trim()
    .notEmpty()
    .withMessage(`authorId ${emptyField}`)
    .isString()
    .withMessage(`authorId ${stringChar}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`authorId ${cuidLength}`),
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`postId ${emptyField}`)
    .isString()
    .withMessage(`postId ${stringChar}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`postId ${cuidLength}`),
  body("postIsPublished")
    .trim()
    .notEmpty()
    .withMessage(`is Published ${emptyField}`)
    .isBoolean()
    .withMessage(`isPublished ${isPublishedBoolean}`),
];

const postUpdater = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      postUpdatervalidationError: errors.array(),
    });
  }

  // check first that a record exist to update it
  // this is to avoid prisma CLient known error :>
  const post = await db.post.getPost(req.params.postId);

  if (!post) {
    throw new PostDoesNotExistError("post doesn't exist");
  }
  const { postTitle, postIsPublished, postContent, postAuthorId } = req.body;
  const { postId } = req.params;

  const data = {
    authorId: postAuthorId,
    content: postContent,
    dateUpdated: new Date(),
    id: postId,
    title: postTitle,
    isPublished: postIsPublished,
  };

  await db.post.updatePost(data);
  res.json({ message: "Post updated" });
});

// reuse authenticate jwt
// copied validation chain and added postId to edit it
const postPutter = [authorTokenAuthenticator, postUpdaterVC, postUpdater];

/****************************************************************************************************************************************** */

const cuidAlphanumeric = "should be alphanumeric";
// that should contain postId validation chain
const postDeleterVc = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage(`id ${emptyField}`)
    .isString()
    .withMessage(`id ${stringChar}`)
    .isAlphanumeric()
    .withMessage(`id ${cuidAlphanumeric}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`id ${titleLength}`),
  body("postTitle")
    .trim()
    .notEmpty()
    .withMessage(`title ${emptyField}`)
    .isString()
    .withMessage(`title ${stringChar}`)
    .isLength({ min: 2, max: 64 })
    .withMessage(`title ${titleLength}`),
];

const postDeleter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      postDeleterValidationError: errors.array(),
    });
  }

  // you want to first find the record
  const post = await db.post.getPostByIdAndTitle(
    req.params.postId,
    req.body.postTitle
  );

  // find first the post before deleting since the prisma.model.delete operation returns an exception
  if (!post) {
    throw new PostDoesNotExistError("post doesn't exist.");
  }

  // do an operation delete here
  await db.post.deletePost(req.params.postId);
  res.json({ message: "Post deleted" });
});

const postRemover = [authorTokenAuthenticator, postDeleterVc, postDeleter];

// post a comment

export default {
  getPosts: posts,
  getPost: post,
  setPost: postAdder,
  updatePost: postPutter,
  deletePost: postRemover,
};
