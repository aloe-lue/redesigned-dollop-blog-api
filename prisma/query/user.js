import prisma from "../client/prismaClient.js";

class User {
  addUser = async (createdDate) => {
    await prisma.user.create({
      data: {
        createdDate,
      },
    });
  };

  // see if there's already email in the db
  getUserByEmail = async (email) => {
    const data = await prisma.user.findUnique({
      select: {
        username: true,
        email: true,
        password: true,
      },
      where: {
        email,
      },
    });
    return data;
  };

  // use this to verify login
  getUserByUsername = async (username) => {
    const data = await prisma.user.findUnique({
      where: { username },
      select: {
        password: true,
        username: true,
        id: true,
      },
    });

    return data;
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
        email,
        username,
        password,
        member: {
          create: {
            slug: "member",
          },
        },
        createdDate,
        userProfile: {
          create: {
            firstName,
            lastName,
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
        email,
        username,
        password,
        author: {
          create: {
            slug: "author",
          },
        },
        createdDate,
        userProfile: {
          create: {
            firstName,
            lastName,
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
