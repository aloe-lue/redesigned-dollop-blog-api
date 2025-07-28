import { faker } from "@faker-js/faker";

const { string, book, date, lorem } = faker;

/**
 *
 * @param { String } authorId
 * @returns
 */
const post = function getRandPost(authorId) {
  return {
    id: string.uuid(),
    title: book.title(),
    content: lorem.paragraphs(5),
    dateCreated: date.recent(),
    dateUpdated: date.future(),
    authorId: authorId,
  };
};

/**
 *
 * @param {*} authorIds
 * @returns
 */
const posts = function getRandPosts(authorIds) {
  return authorIds.map(({ id }) => post(id));
};

export default posts;
