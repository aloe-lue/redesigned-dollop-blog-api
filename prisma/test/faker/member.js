import { faker } from "@faker-js/faker";
const { string } = faker;

const member = function getRandMember() {
  return {
    id: string.uuid(),
    userId: string.uuid(),
  };
};

export default member;
