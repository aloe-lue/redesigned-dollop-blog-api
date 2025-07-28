import { faker } from "@faker-js/faker";

const { string, date, helpers } = faker;

const user = function getRandUser() {
  return {
    id: string.uuid(),
    createdDate: date.recent(),
  };
};

const users = helpers.multiple(user, { count: 10 });

export default users;
