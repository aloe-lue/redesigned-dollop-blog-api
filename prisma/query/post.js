import prisma from "../client/prismaClient.js";
import comment from "./comment.js";

class Post {
  addPost = async (data) => {
    const { id, content, dateCreated, dateUpdated, authorId, isPublished } =
      data;
    await prisma.post.create({
      data: {
        id,
        content,
        dateCreated,
        dateUpdated,
        authorId,
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

  getPostIdsByAuthorId = async (authorId) => {
    const data = await prisma.post.findMany({
      where: {
        authorId,
      },
      select: {
        id: true,
      },
    });

    return data;
  };

  getPostsByAuthorId = async (authorId) => {
    const data = await prisma.post.findMany({
      include: {
        comments: false,
        author: true,
      },
      where: {
        authorId,
      },
      take: 5,
    });

    return data;
  };

  getPosts = async () => {
    const data = await prisma.post.findMany({
      take: 10,
      select: {
        id: true,
        dateCreated: true,
        dateUpdated: true,
        author: false,
        authorId: true,
        comments: false,
      },
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
        author: false,
        authorId: true,
        comments: false,
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
      select: {
        id: true,
        content: true,
        dateCreated: true,
        dateUpdated: true,
        author: {
          select: {
            id: true,
            userId: true,
          },
        },
        // don't include all comments at all once
        comments: false,
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
  deletePosts = async (authorId) => {
    await prisma.post.deleteMany({
      where: {
        authorId,
      },
    });
  };

  updatePost = async (data) => {
    const { id, content, dateUpdated } = data;
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
        content,
        dateUpdated,
        isPublished,
      },
    });
  };
}

export default new Post();
