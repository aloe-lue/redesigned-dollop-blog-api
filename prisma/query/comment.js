import prisma from "../client/prismaClient.js";

class Comment {
  addComment = async (data) => {
    const { title, content, dateCreated, dateUpdated, userId, postId } = data;
    await prisma.comment.create({
      data: {
        title,
        content,
        dateCreated,
        dateUpdated,
        userId,
        postId,
      },
    });
  };

  // * useful for geting post comments
  getComments = async (postId) => {
    const data = await prisma.comment.findMany({
      where: {
        postId,
      },
    });

    return data;
  };

  // change comment title as well as content
  updateComment = async (data) => {
    const { id, title, content, dateUpdated } = data;
    await prisma.comment.update({
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
      where: userId,
    });
  };

  // used to delete posts
  // useful for deleting comments based on postIds
  // to delete user with author
  deletePostsComments = async (postIds) => {
    await prisma.comment.deleteMany({
      where: {
        postId: {
          in: postIds,
        },
      },
    });
  };
}

export default new Comment();
