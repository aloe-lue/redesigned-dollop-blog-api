import { faker } from "@faker-js/faker";

const { string, image, lorem, date } = faker;

const picture = function getRandPicture(profileId) {
  return {
    id: string.uuid(),
    url: image.avatar(),
    caption: lorem.sentence(),
    profileId: profileId,
    createdDate: date.recent(),
  };
};

const pictures = function getRandPictures(profileIds) {
  return profileIds.map(({ id }) => picture(id));
};

export default pictures;
