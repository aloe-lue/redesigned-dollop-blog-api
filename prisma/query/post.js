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
    await prisma.post.create({
      data: {
        title,
        id,
        content,
        dateCreated,
        dateUpdated,
        userId,
        isPublished,
      },
    });
  };

  getPostById = async (id) => {
    const data = await prisma.post.findId({
      where: {
        id,
      },
    });

    return data;
  };

  getPostsByUserId = async (userId) => {
    const data = await prisma.post.findMany({
      include: {
        comments: false,
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
        comments: false,
        user: true,
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
        comments: false,
        user: false
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
        comments: false,
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
        id: true,
        content: true,
        dateCreated: true,
        dateUpdated: true,
        comments: false,
        user: false,
        userId: true,
      },
    });
    return data;
  };

  deletePost = async (id) => {
    await prisma.$transaction([
      comment.deletePostComments(id),
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
    const { id, content, dateUpdated, title } = data;
    let { isPublished = "false" } = data;

    let isPublishedBoolean = true;
    if (typeof isPublished !== "boolean") {
      isPublishedBoolean = false;
    }

    const isPublishedBooleanColl = {
      false: false,
      true: true,
    };

    if (!isPublishedBoolean) {
      isPublished = isPublishedBooleanColl[isPublished];
    }

    await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        dateUpdated,
        isPublished,
      },
    });
  };
}

export default new Post();
