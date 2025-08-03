import prisma from "../client/prismaClient.js";

class User {
  addUser = async (createdDate) => {
    await prisma.user.create({
      data: {
        createdDate,
      },
    });
  };

  deleteUser = async (id) => {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  };

  deleteUserMember = async (comments, pictures, profile, member) => {
    await prisma.$transaction([
      // delete the following related tables
      comments,
      pictures,
      profile,
      member,
      // finalyy delete user
      this.deleteUser,
    ]);
  };

  deleteUserAuthor = async (comments, posts, pictures, profile, author) => {
    await prisma.$transaction([
      // delete the following related tables
      comments,
      posts,
      pictures,
      profile,
      author,
      // finalyy delete user
      this.deleteUser,
    ]);
  };
}

export default new User();
