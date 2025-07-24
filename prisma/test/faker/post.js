import { faker } from "@faker-js/faker";

const { string, book, date, lorem } = faker;

const post = function getRandPost() {
  return {
    id: string.uuid(),
    title: book.title(),
    content: lorem.paragraphs(5),
    dateCreated: date.recent(),
    dateUpdated: date.anytime(),
    postId: string.uuid(),
  };
};

export default post;
