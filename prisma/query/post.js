import prisma from "../client/prismaClient.js";
import comment from "./comment.js";

class Post {
  addPost = async (data) => {
    const {
      id,
      content,
      title,
      dateCreated,
      dateUpdated,
      userId,
      isPublished,
    } = data;

    let isPostPublished;

    if (typeof isPublished !== "boolean") {
      isPostPublished = isPublished === "true";
    }

    await prisma.post.create({
      data: {
        title,
        id,
        content,
        dateCreated,
        dateUpdated,
        userId,
        isPublished: isPostPublished,
      },
    });
  };

  getPostById = async (id) => {
    const data = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    return data;
  };

  getPostsByUserId = async (userId) => {
    const data = await prisma.post.findMany({
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
      where: {
        userId,
      },
      take: 5,
      orderBy: {
        dateCreated: "desc",
      },
    });

    return data;
  };

  getPostIdsByUserIdOffset = async (userId, skips) => {
    const data = await prisma.post.findMany({
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
      where: {
        userId,
      },
      take: 5,
      skip: skips,
    });

    return data;
  };

  getPosts = async () => {
    const data = await prisma.post.findMany({
      select: {
        title: true,
        id: true,
        dateCreated: true,
        dateUpdated: true,
        userId: true,
        _count: {
          select: {
            comments: true,
          },
        },
        user: false,
      },
      take: 10,
      where: {
        isPublished: true,
      },
    });

    return data;
  };

  getPostsPage = async (skip = 1) => {
    const data = await prisma.post.findMany({
      take: 10,
      skip: 10 * skip,
      select: {
        id: true,
        dateCreated: true,
        dateUpdated: true,
        _count: {
          select: {
            comments: true,
          },
        },
        userId: true,
        user: false,
      },

      where: {
        isPublished: true,
      },
    });

    return data;
  };

  getPost = async (id) => {
    const data = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        user: false,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return data;
  };

  deletePost = async (id) => {
    await prisma.$transaction([
      prisma.comment.deleteMany({
        where: {
          postId: id,
        },
      }),

      prisma.post.delete({
        where: {
          id,
        },
      }),
    ]);
  };

  // useful when deleting author account
  deletePosts = async (userId) => {
    await prisma.post.deleteMany({
      where: {
        userId,
      },
    });
  };

  updatePost = async (data) => {
    const { id, content, dateUpdated, title, isPublished } = data;

    let isPostPublished;
    if (typeof isPublished !== "boolean") {
      isPostPublished = isPostPublished === "true";
    }

    await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        dateUpdated,
        isPublished: isPostPublished,
      },
    });
  };
}

export default new Post();
