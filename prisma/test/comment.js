import faker from "./faker/index.js";
import prisma from "../client/prismaClient.js";

const randCommentOnPosts = async function getRandComments(userId, postIds) {
  const commentOnPosts = await prisma.comment.createManyAndReturn({
    data: faker.comment(userId, postIds),
  });

  return commentOnPosts;
};

export default randCommentOnPosts;
