import fake from "./faker/index.js";
import prisma from "../client/prismaClient.js";
import { faker } from "@faker-js/faker";

const randAuthor = async function getRandAuthor() {
  // getRandUser
  const users = await prisma.user.createManyAndReturn({
    data: faker.helpers.multiple(
      () => {
        return { id: faker.string.uuid(), createdDate: faker.date.recent() };
      },
      { count: 10 }
    ),
  });

  // assign user author role
  const authors = await prisma.author.createManyAndReturn({
    data: fake.author(users),
  });

  // add user profile
  const profiles = await prisma.profile.createManyAndReturn({
    data: fake.profile(users),
  });

  // add profile picture
  const pictures = await prisma.picture.createManyAndReturn({
    data: fake.picture(profiles),
  });

  return { users, authors };
};

export default randAuthor;
