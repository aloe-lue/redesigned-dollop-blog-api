import asyncHandler from "express-async-handler";
import db from "../prisma/query/index.js";
import { query, validationResult } from "express-validator";
import PostExhaustedError from "../errors/postsExhaustedError.js";

const pageQuery = "should be numeric";

const getPostsVc = [
  query("page").trim().optional().isNumeric().withMessage(`page ${pageQuery}`),
];

const getPosts = asyncHandler(async (req, res) => {
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
  if (numberPage) {
    // this might break things, so you want to add something that adds as backings
    // page is * 10
    posts = await db.post.getPostsPage(numberPage);
  } else {
    posts = await db.post.getPosts();
  }

  if (!posts || posts.length === 0) {
    throw new PostExhaustedError("post exhausted nothing here");
  }

  res.json(posts);
});

const postsChainMiddlewares = [getPostsVc, getPosts];

export default { getPosts: postsChainMiddlewares };
