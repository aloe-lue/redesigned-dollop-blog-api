import { faker } from "@faker-js/faker";

const { string, book, date, lorem } = faker;

/**
 *
 * @param {*} userId
 * @param {*} postId
 * @returns
 */
const comment = function getRandComment(userId, postId) {
  return {
    id: string.uuid(),
    title: book.title(),
    content: lorem.paragraph(),
    dateCreated: date.recent(),
    dateUpdated: date.anytime(),
    userId: userId,
    postId: postId,
  };
};

/**
 *
 * @param {*} userIds
 * @param {*} postId
 */
const commentsOnPost = function getRandCommentsOnPost(userIds, postId) {
  // do this when you want comments on post;
};

// comment on many posts
const commentOnPosts = function getRandCommentOnPosts(userId, postIds) {
  return postIds.map(({ id }) => comment(userId, id));
};

export default commentOnPosts;
