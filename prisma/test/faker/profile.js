import { faker } from "@faker-js/faker";

const { string, internet, person } = faker;

const profile = function getRandProfile() {
  return {
    id: string.uuid(),
    email: internet.email(),
    firstName: person.firstName(),
    lastName: person.lastName(),
    password: internet.password(),
    role: person.jobTitle(),
    bio: person.bio(),
    userId: string.uuid(),
  };
};

export default profile;
