import prisma from "../client/prismaClient.js";

class Member {
  addMember = async (userId, slug) => {
    await prisma.member.create({
      data: {
        userId,
        slug,
      },
    });
  };

  deleteMember = async (userId) => {
    await prisma.member.delete({
      where: {
        userId,
      },
    });
  };
}

export default new Member();
