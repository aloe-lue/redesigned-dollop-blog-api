import { faker } from "@faker-js/faker";

const { string, image, lorem, date } = faker;

const picture = function getRandPicture() {
  return {
    id: string.uuid(),
    url: image.avatar(),
    caption: lorem.sentence(),
    profileId: string.uuid(),
    createdDate: date.recent(),
  };
};

export default picture;
