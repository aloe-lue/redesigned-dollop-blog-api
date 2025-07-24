import { faker } from "@faker-js/faker";

const { string, date } = faker;

const user = function getRandUser() {
  return {
    id: string.uuid(),
    createdDate: date.recent(),
  };
};

export default user;
