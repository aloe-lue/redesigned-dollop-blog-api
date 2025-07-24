import { faker } from "@faker-js/faker";

const { string } = faker;

const author = function getRandAuthor() {
  return {
    id: string.uuid(),
    userId: string.uuid(),
  };
};

export default author;
