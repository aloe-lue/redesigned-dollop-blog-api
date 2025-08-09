import prisma from "../client/prismaClient.js";

class Profile {
  addProfile = async (data) => {
    const { firstName, lastName, middleName, userId } = data;
    await prisma.profile.create({
      data: {
        firstName,
        lastName,
        middleName,
        userId,
      },
    });
  };

  getProfileByEmail = async (email) => {
    const data = await prisma.profile.findUnique({
      where: {
        email,
      },
    });

    return data;
  };

  getProfile = async (data) => {
    const { id, firstName, lastName, username } = data;
    await prisma.profile.findUnique({
      where: {
        id,
        firstName,
        lastName,
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
