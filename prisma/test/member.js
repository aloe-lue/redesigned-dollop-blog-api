import fake from "./faker/index.js";
import prisma from "../client/prismaClient.js";
import { faker } from "@faker-js/faker";

const randMembers = async function setRandMember() {
  const users = await prisma.user.createManyAndReturn({
    data: faker.helpers.multiple(
      () => {
        return { id: faker.string.uuid(), createdDate: faker.date.recent() };
      },
      { count: 10 }
    ),
  });

  // default should be member
  const members = await prisma.member.createManyAndReturn({
    data: fake.member(users),
  });

  // user should have profile
  const profiles = await prisma.profile.createManyAndReturn({
    data: fake.profile(users),
  });

  // profiles should have each their default picture
  const pictures = await prisma.picture.createManyAndReturn({
    data: fake.picture(profiles),
  });

  return users;
};

export default randMembers;
