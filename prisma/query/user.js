import prisma from "../client/prismaClient.js";
import picture from "./picture.js";
import profile from "./profile.js";
import author from "./author.js";
import post from "./post.js";
import comment from "./comment.js";
import member from "./member.js";

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
        author: {
          select: {
            slug: true,
          },
        },
      },
    });

    return data;
  };

  addUserMember = async (data) => {
    const { createdDate, email, firstName, lastName, username, password } =
      data;
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

  addUserAuthor = async (data) => {
    const { createdDate, email, firstName, lastName, username, password } =
      data;
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
      select: {
        id: true,
        username: true,
        email: true,
        password: false,
        author: true,
        member: true,
        userProfile: true,
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

  deleteUserMember = async (user) => {
    // delete all user owned comments
    await comment.deleteUserComments(user.id);

    // delete profilePictures
    await picture.deletePictures(user.userProfile.id);

    // delete profile
    await profile.deleteProfile(user.id);

    // delete member
    await member.deleteMember(user.id);

    // finalyy delete user
    await this.deleteUser(user.id);
  };

  deleteUserAuthor = async (postIds, user) => {
    // delete all comments that the author posts contain
    await comment.deletePostsComments(postIds);

    // delete author posts
    await post.deletePosts(user.author.id);

    // delete profilePicture
    await picture.deletePictures(user.userProfile.id);

    // delete profile
    await profile.deleteProfile(user.id);

    // delete author
    await author.deleteAuthor(user.id);

    // finalyy delete user
    await this.deleteUser(user.id);
  };
}

export default new User();
