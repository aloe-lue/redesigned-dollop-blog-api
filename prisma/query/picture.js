import prisma from "../client/prismaClient.js";

class Picture {
  addPicture = async (data) => {
    const { url, caption, profileId, createdDate } = data;
    await prisma.picture.create({
      data: {
        url,
        caption,
        profileId,
        createdDate,
      },
    });
  };

  // allows deletion when there's more than one record
  deletePicture = async (id) => {
    await prisma.picture.delete({
      where: {
        id,
      },
    });
  };

  // delete profile pictures -- useful for deleting user
  deletePictures = async (profileId) => {
    await prisma.picture.deleteMany({
      where: {
        profileId,
      },
    });
  };
}

export default new Picture();
