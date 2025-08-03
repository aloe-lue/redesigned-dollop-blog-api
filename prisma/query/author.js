import prisma from "../client/prismaClient.js";

class Author {
  // add single author
  addAuthor = async (userId, slug) => {
    await prisma.author.create({
      data: {
        userId,
        slug,
      },
    });
  };

  // delete single author
  deleteAuthor = async (userId) => {
    await prisma.author.delete({
      where: {
        userId,
      },
    });
  };
}

export default new Author();
