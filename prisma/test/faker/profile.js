import { faker } from "@faker-js/faker";

const { string, internet, person } = faker;

const profile = function getRandProfile(userId) {
  return {
    id: string.uuid(),
    email: internet.email(),
    firstName: person.firstName(),
    lastName: person.lastName(),
    password: internet.password(),
    role: person.jobTitle(),
    bio: person.bio(),
    userId: userId,
  };
};

const profiles = function getRandProfiles(userIds) {
  return userIds.map(({ id }) => profile(id));
};

export default profiles;
