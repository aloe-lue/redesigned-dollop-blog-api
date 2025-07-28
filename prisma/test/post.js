import faker from "./faker/index.js";
import prisma from "../client/prismaClient.js";

// each author have post
const randPosts = async function getRandPost(authorIds) {
  const posts = await prisma.post.createManyAndReturn({
    data: faker.post(authorIds),
  });

  return posts;
};

export default randPosts;
