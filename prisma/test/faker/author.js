import { faker } from "@faker-js/faker";

const { string } = faker;

const author = function getRandAuthor(userId) {
  return {
    id: string.uuid(),
    userId: userId,
  };
};

const authors = function getRandAuthors(userIds) {
  return userIds.map(({ id }) => author(id));
};

export default authors;
