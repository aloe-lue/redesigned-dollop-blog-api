import asyncHandler from "express-async-handler";
import db from "../prisma/query/index.js";
import { query, param, body, validationResult } from "express-validator";
import passport from "passport";
import PostDoesNotExistError from "../errors/postDoesNotExistError.js";
import PostExhaustedError from "../errors/postsExhaustedError.js";
import "dotenv/config";
import {
  Strategy as JwtStrategy,
  ExtractJwt as extractJwt,
} from "passport-jwt";
import UserDoesNotExistError from "../errors/userDoesNotExistError.js";

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

const JwtStrateyPassport = new JwtStrategy(
  {
    jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTHOR_JWT_SECRET,
  },
  async (jwtPayload, done) => {
    const user = await db.user.getUserById(jwtPayload.userId);

    // verify jwt token
    if (!user) {
      return done(null, false, { message: "invalid user" });
    }

    return done(null, { userId: jwtPayload.userId });
  }
);

// authenticate author jwt token user == author
const authorTokenAuthenticator = asyncHandler(async (req, res, next) => {
  // use the jwt strategy
  passport.use(JwtStrateyPassport);
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
const minMaxContent = "should be between 500 to 10000 characters.";
const cuidLength = "should be exactly 25 characters";
const titleLength = "should be between 3 to 255.";

const postSetterVc = [
  body("postTitle")
    .trim()
    .notEmpty()
    .withMessage(`title ${emptyField}`)
    .isString()
    .withMessage(`title ${stringChar}`)
    .isLength({ min: 3, max: 255 })
    .withMessage(`title ${titleLength}`),
  body("postContent")
    .trim()
    .notEmpty()
    .withMessage(`content ${emptyField}`)
    .isString()
    .withMessage(`content ${stringChar}`)
    .isLength({ min: 500, max: 10000 })
    .withMessage(`content ${minMaxContent}`),
  body("postUserId")
    .trim()
    .notEmpty()
    .withMessage(`userId ${emptyField}`)
    .isString()
    .withMessage(`userId ${stringChar}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`userId ${cuidLength}`),
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
    title: bodyReq.postTitle,
    userId: bodyReq.postUserId,
    content: bodyReq.postContent,
    dateCreated: new Date(),
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
    .isLength({ min: 3, max: 255 })
    .withMessage(`title ${titleLength}`),
  body("postContent")
    .trim()
    .notEmpty()
    .withMessage(`content ${emptyField}`)
    .isString()
    .withMessage(`content ${stringChar}`)
    .isLength({ min: 500, max: 10000 })
    .withMessage(`content ${minMaxContent}`),
  body("postUserId")
    .trim()
    .notEmpty()
    .withMessage(`UserId ${emptyField}`)
    .isString()
    .withMessage(`UserId ${stringChar}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`UserId ${cuidLength}`),
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
  const { postIsPublished, postContent, postUserId, postTitle } = req.body;
  const { postId } = req.params;

  const data = {
    title: postTitle,
    userId: postUserId,
    content: postContent,
    dateUpdated: new Date(),
    id: postId,
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
    .withMessage(`id ${postLength}`),
];

const postDeleter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      postDeleterValidationError: errors.array(),
    });
  }

  // you want to first find the record
  const post = await db.post.getPostById(req.params.postId);

  // find first the post before deleting since the prisma.model.delete operation returns an exception
  if (!post) {
    throw new PostDoesNotExistError("post doesn't exist.");
  }

  // do an operation delete here
  await db.post.deletePost(req.params.postId);
  res.json({ message: "Post deleted" });
});

const postRemover = [authorTokenAuthenticator, postDeleterVc, postDeleter];

const skipsNumeric = "should be number";
const skipLimits = "should be around like 1 up to 100000";

const authorPostsVc = [
  param("userId")
    .trim()
    .notEmpty()
    .withMessage(`userId ${postEmpty}`)
    .isString()
    .withMessage(`userId ${postString}`)
    .isAlphanumeric()
    .withMessage(`userId ${postAlphaNum}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`userId ${cuidLength}`),
  query("skips")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(`skips ${emptyField}`)
    .isNumeric()
    .withMessage(`skips ${skipsNumeric}`)
    .custom((value) => {
      const val = Number(value);
      return val >= 1 && val < Number.MAX_SAFE_INTEGER;
    })
    .withMessage(`skips ${skipLimits}`),
];

const authorPosts = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      userPostsValidationError: errors.array(),
    });
  }

  const user = await db.user.getUserById(req.params.userId);
  if (!user) {
    throw new UserDoesNotExistError("user does not exist.");
  }

  const { skips } = req.query;
  const skipNum = Number(skips) || 0;

  let posts;

  if (skipNum >= 1 && skipNum < Number.MAX_SAFE_INTEGER) {
    posts = await db.post.getPostIdsByUserIdOffset(user.id, skipNum);
  } else {
    posts = await db.post.getPostsByUserId(user.id);
  }

  res.json(posts);
});

//
const authorPostsGetter = [
  authorTokenAuthenticator,
  authorPostsVc,
  authorPosts,
];

export default {
  getPosts: posts,
  getPost: post,
  setPost: postAdder,
  updatePost: postPutter,
  deletePost: postRemover,
  getAuthorPosts: authorPostsGetter,
};
