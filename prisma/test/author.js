import faker from "./faker/index.js";
import prisma from "../client/prismaClient.js";

const randAuthor = async function getRandAuthor() {
  // getRandUser
  const users = await prisma.user.createManyAndReturn({
    data: faker.user,
  });

  // assign user author role
  const authors = await prisma.author.createManyAndReturn({
    data: faker.author(users),
  });

  // add user profile
  const profiles = await prisma.profile.createManyAndReturn({
    data: faker.profile(users),
  });

  // add profile picture
  const pictures = await prisma.picture.createManyAndReturn({
    data: faker.picture(profiles),
  });

  return { users, authors };
};

export default randAuthor;
