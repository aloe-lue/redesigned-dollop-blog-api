import { faker } from "@faker-js/faker";

const { string, book, date, lorem } = faker;

const comment = function getRandComment() {
  return {
    id: string.uuid(),
    title: book.title(),
    content: lorem.paragraph(),
    dateCreated: date.recent(),
    dateUpdated: date.anytime(),
    userId: string.uuid(),
    postId: string.uuid(),
  };
};

export default comment;
