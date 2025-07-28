import faker from "./faker/index.js";
import prisma from "../client/prismaClient.js";

const randMembers = async function setRandMember() {
  const users = await prisma.user.createManyAndReturn({
    data: faker.user,
  });

  // default should be member
  const members = await prisma.member.createManyAndReturn({
    data: faker.member(users),
  });

  // user should have profile
  const profiles = await prisma.profile.createManyAndReturn({
    data: faker.profile(users),
  });

  // profiles should have each their default picture
  const pictures = await prisma.picture.createManyAndReturn({
    data: faker.picture(profiles),
  });

  return users;
};

export default randMembers;
