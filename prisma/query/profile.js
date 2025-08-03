import prisma from "../client/prismaClient.js";

class Profile {
  addProfile = async (data) => {
    const { email, firstName, lastName, middleName, password, userId } = data;
    await prisma.profile.create({
      data: {
        email,
        firstName,
        lastName,
        middleName,
        password,
        userId,
      },
    });
  };

  getProfile = async (data) => {
    const { id, firstName, lastName, username } = data;
    await prisma.profile.findUnique({
      where: {
        id,
        firstName,
        lastName,
        username,
      },
    });
  };

  updateProfile = async (data) => {
    const { id, email, username, password } = data;
    await prisma.profile.update({
      where: {
        id,
      },
      data: {
        email,
        username,
        password,
      },
    });
  };

  deleteProfile = async (userId) => {
    await prisma.profile.delete({
      where: {
        userId,
      },
    });
  };
}

export default new Profile();
