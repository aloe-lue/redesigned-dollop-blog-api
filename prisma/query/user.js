import prisma from "../client/prismaClient.js";

class User {
  addUser = async (createdDate) => {
    await prisma.user.create({
      data: {
        createdDate,
      },
    });
  };

  addUserAuthor = async (
    createdDate,
    email,
    firstName,
    lastName,
    username,
    password
  ) => {
    await prisma.user.create({
      data: {
        author: {
          create: {
            slug: "author",
          },
        },
        createdDate,
        userProfile: {
          create: {
            email,
            firstName,
            lastName,
            username,
            password,
            profilePicture: {
              create: {
                url: "default.png",
                createdDate,
              },
            },
          },
        },
      },
    });
  };

  addUserMember = async (
    createdDate,
    email,
    firstName,
    lastName,
    username,
    password
  ) => {
    await prisma.user.create({
      data: {
        member: {
          create: {
            slug: "member",
          },
        },
        createdDate,
        userProfile: {
          create: {
            email,
            firstName,
            lastName,
            username,
            password,
            profilePicture: {
              create: {
                url: "default.png",
                createdDate,
              },
            },
          },
        },
      },
    });
  };

  getUserById = async (id) => {
    const data = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return data;
  };

  deleteUser = async (id) => {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  };

  deleteUserMember = async (comments, pictures, profile, member) => {
    await prisma.$transaction([
      // delete the following related tables
      comments,
      pictures,
      profile,
      member,
      // finalyy delete user
      this.deleteUser,
    ]);
  };

  deleteUserAuthor = async (comments, posts, pictures, profile, author) => {
    await prisma.$transaction([
      // delete the following related tables
      comments,
      posts,
      pictures,
      profile,
      author,
      // finalyy delete user
      this.deleteUser,
    ]);
  };
}

export default new User();
