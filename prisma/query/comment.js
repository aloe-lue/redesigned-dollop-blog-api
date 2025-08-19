import prisma from "../client/prismaClient.js";

class Comment {
  addComment = async (data) => {
    const { content, dateCreated, userId, postId } = data;
    await prisma.comment.create({
      data: {
        content,
        dateCreated,
        userId,
        postId,
      },
    });
  };

  // useful for geting post comments
  getComments = async (postId) => {
    const data = await prisma.comment.findMany({
      where: {
        postId,
      },
      take: 5,
    });

    return data;
  };

  // should use cursor pagination
  getCommentsOffsets = async (postId, skips) => {
    const data = await prisma.comment.findMany({
      where: {
        postId,
      },

      take: 5,
      skip: skips,
    });

    return data;
  };

  getComment = async (id) => {
    const data = await prisma.comment.findUnique({
      where: {
        id,
      },
    });
    return data;
  };

  getCommentByIdAndPost = async (postId, id) => {
    const data = await prisma.comment.findUnique({
      where: {
        id,
        postId,
      },
    });
    return data;
  };

  // change  content and dateUpdated
  updateComment = async (data) => {
    const { id, content, dateUpdated } = data;
    await prisma.comment.update({
      where: {
        id,
      },
      data: {
        content,
        dateUpdated,
      },
    });
  };

  deleteComment = async (id) => {
    await prisma.comment.delete({
      where: {
        id,
      },
    });
  };

  deletePostComments = async (postId) => {
    await prisma.comment.deleteMany({
      where: {
        postId,
      },
    });
  };

  // useful when deleting member
  deleteUserComments = async (userId) => {
    await prisma.comment.deleteMany({
      where: { userId },
    });
  };

  // used to delete posts
  // useful for deleting comments based on postIds
  // to delete user with author
  deletePostsComments = async (postIds) => {
    // recieves from other db request [{ id: cuid }]
    const ids = postIds.map(({ id }) => id);

    await prisma.comment.deleteMany({
      where: {
        postId: {
          in: ids,
        },
      },
    });
  };
}

export default new Comment();
