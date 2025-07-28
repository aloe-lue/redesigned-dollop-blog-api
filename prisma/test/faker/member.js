import { faker } from "@faker-js/faker";
const { string } = faker;

const member = function getRandMember(userId) {
  return {
    id: string.uuid(),
    userId: userId,
  };
};

const members = function getRandMembers(userIds) {
  return userIds.map(({ id }) => member(id));
};

export default members;
