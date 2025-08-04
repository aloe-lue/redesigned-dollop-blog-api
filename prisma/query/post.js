import prisma from "../client/prismaClient.js";

class Post {
  addPost = async (data) => {
    const { id, title, content, dateCreated, dateUpdated, authorId } = data;
    await prisma.post.create({
      data: {
        id,
        title,
        content,
        dateCreated,
        dateUpdated,
        authorId,
      },
    });
  };

  getPosts = async () => {
    const data = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        dateCreated: true,
        dateUpdated: true,
        author: true,
        authorId: true,
        comments: false,
      },
    });

    return data;
  };

  getPost = async (id) => {
    const data = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        content: true,
        title: true,
        dateCreated: true,
        dateUpdated: true,
        author: true,
        authorId: true,
        comments: true,
      },
    });

    return data;
  };

  deletePost = async (authorId) => {
    await prisma.post.delete({
      where: {
        authorId,
      },
    });
  };

  // useful when deleting author account
  deletePosts = async (authorId) => {
    await prisma.post.deleteMany({
      where: {
        authorId,
      },
    });
  };

  updatePost = async (data) => {
    const { id, title, content, dateUpdated } = data;
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        dateUpdated,
      },
    });
  };
}

export default new Post();
