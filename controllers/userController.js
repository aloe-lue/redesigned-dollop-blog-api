import asyncHandler from "express-async-handler";
import {
  validationResult,
  body,
  header,
  query,
  param,
} from "express-validator";
import * as bcrypt from "bcrypt";
import db from "../prisma/query/index.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as LocalStrategy } from "passport-local";
import "dotenv/config";
import UserExistError from "../errors/userExistError.js";
import { jwtDecode } from "jwt-decode";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import UserDoesNotExistError from "../errors/userDoesNotExistError.js";

// ! important => fix this login that can be accessed by user both member and author
// todo: make errors known handle next err that cuts through 404 not found or 500 internal server error
// ? i intend to not implement rate limiting

const empty = "should not be left empty.";
const firstName = "should be a firstName such as John.";
const lastName = "should be a lastName such as Doe ";
const firstNameLength = "shouldn't exceed 255 or lower than 3 characters.";
const email = "should be a valid email like johndoe@mail.com";
const username =
  "should be alphanumeric with or without undescore - and lowdash -.";
const usernameLength = "shouldn't exceed 32 or lower than 4 characters";
const password =
  "should be min of 8 characters containing lowcase, upcase, symbol, and number.";
const confirmPassword = "and password does not match.";
const passwordLength = "should be 8 to 64 characters.";
const stringCharacter = "should be a string";
const authorSecretPassword = "doesn't match with author_secret";

const userAdderVc = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage(`firstName ${empty}`)
    .isString()
    .withMessage(`firstName ${stringCharacter}`)
    .matches(/^[a-zA-Z\s]+$/) // todo: should do testing on these regEx as it raises concerns within me wether it's good or not
    .withMessage(`firstName ${firstName}`)
    .isLength({ min: 3, max: 60 })
    .withMessage(`firstName ${firstNameLength}`),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage(`lastName ${empty}`)
    .isString()
    .withMessage(`lastName ${stringCharacter}`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`lastName ${lastName}`)
    .isLength({ min: 3, max: 60 })
    .withMessage(`lastName ${firstNameLength}`),
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`username ${empty}`)
    .isLength({ min: 4, max: 32 })
    .withMessage(`username ${usernameLength}`)
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(`username ${username}`)
    .custom(async (value) => {
      const data = await db.user.getUserByUsername(value);
      if (data) {
        throw new UserExistError("Username is already taken.");
      }
    }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`email ${empty}`)
    .isEmail()
    .withMessage(`email ${email}`)
    .custom(async (value) => {
      const data = await db.user.getUserByEmail(value);
      if (data) {
        throw new UserExistError("Email is already in use");
      }
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`password ${empty}`)
    .isStrongPassword()
    .withMessage(`password ${password}`)
    .isLength({ min: 8, max: 64 })
    .withMessage(`password ${passwordLength}`),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage(`confirm password ${empty}`)
    .isStrongPassword()
    .withMessage(`confirm password ${password}`)
    .isLength({ min: 8, max: 64 })
    .withMessage(`confirm password ${passwordLength}`)
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage(`confirm password ${confirmPassword}`),
  body("authorPassword")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(`authorPassword ${empty}`)
    .isStrongPassword()
    .withMessage(`authorPassword ${password}`)
    .isLength({ min: 8, max: 64 })
    .withMessage(`authorPassword ${passwordLength}`)
    .custom((value) => {
      // make sure to match the author-password
      const isMatch = bcrypt.compareSync(value, process.env.AUTHOR_PASSWORD);
      return isMatch;
    })
    .withMessage(`author password ${authorSecretPassword}`),
];

/**
 * add user member
 */
const userAdder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      userAdderValidationError: errors.array(),
    });
  }

  const { email, firstName, lastName, username, password, authorPassword } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const data = {
    createdDate: new Date(),
    email: email,
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: hashedPassword,
  };

  // you want to check if the user really correct the author password
  if (typeof authorPassword !== "undefined") {
    await db.user.addUserAuthor(data);
  } else {
    await db.user.addUserMember(data);
  }

  res.json({
    message: `user ${
      typeof authorPassword !== "undefined" ? "author" : "member"
    } added`,
  });
});

/**
 * middleware for adding user member
 */
const userSetter = [userAdderVc, userAdder];

const validEmail = "should be a valid email like johndoe@gmail.com";

const userLoginVC = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`email ${empty}`)
    .isEmail()
    .withMessage(`email ${validEmail}`),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`password ${empty}`)
    .isStrongPassword()
    .withMessage(`password ${password}`)
    .isLength({ min: 8, max: 64 })
    .withMessage(`password ${passwordLength}`),
];

const validationLogin = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      loginValidationError: errors.array(),
    });
  }
  // validation passed
  next();
});

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    const user = await db.user.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: "Incorrect email" });
    }
    // compare user input password with  hashed user password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: "Incorrect password" });
    }
    // send minimal data as payload to jwt
    return done(null, user.id);
  }
);

/**
 * give token to user
 */
const tokenForUser = asyncHandler(async (req, res) => {
  passport.use(localStrategy);
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) {
        return res.status(401).json({ message: info.message });
      }

      if (!user) {
        return res.status(403).json({ message: info.message });
      }

      // this is to get user role
      const userGetter = await db.user.getUserById(user);

      let jwtSecret;
      if (userGetter.member === null) {
        jwtSecret = process.env.AUTHOR_JWT_SECRET;
      } else {
        jwtSecret = process.env.MEMBER_JWT_SECRET;
      }

      const token = jwt.sign({ userId: user }, jwtSecret, {
        algorithm: "HS256",
        expiresIn: "15d",
      });

      // give token to user == member
      res.json({ token });
    }
  )(req, res);
});

const userTokenGetter = [userLoginVC, validationLogin, tokenForUser];

const logOutUser = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }

    res.json({ logOutMessage: "you're logged out!" });
  });
});

const emptyField = "should not be left empty.";

const authenticateUserJwtVc = [
  header("authorization")
    .trim()
    .notEmpty()
    .withMessage(`authorization ${emptyField}`),
];

const authenticateUserJwt = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  let userRole;

  if (!errors.isEmpty) {
    return res.status(404).json({
      commentAuthenticationValidationError: errors.array(),
    });
  }

  const headerField = "authorization";
  const reqHeader = req.headers[headerField];

  // this could go awry but passport use or passport authenticate know it
  if (typeof reqHeader !== undefined) {
    const bearerToken = req.headers["authorization"].split(" ")[1];

    // get jwt payload using jwt-decode dependency
    const decodedJwt = jwtDecode(bearerToken);

    if (!decodedJwt) {
      throw new JwtDecodeError("jwt is not valid");
    }

    // role checks for making member or author comments
    const user = await db.user.getUserById(decodedJwt.userId);
    // make sure to find that such user exist
    if (!user) {
      throw new UserExistError("there is no user.");
    }

    // prisma findunique returns user.author = {} or user.member = null
    if (user.member == null) {
      userRole = "author";
    } else {
      userRole = "member";
    }
  }

  const jwtStrategyOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:
      userRole === "member"
        ? process.env.MEMBER_JWT_SECRET
        : process.env.AUTHOR_JWT_SECRET,
  };

  const jwtCbFunction = async (jwtPayload, done) => {
    // get user by id again because we can't access what's inside the passport use jwtCbFunction but is it possible?
    const user = await db.user.getUserById(jwtPayload.userId);
    if (!user) {
      return done(null, false, { message: "Invalid user" });
    }
    return done(null, { userId: jwtPayload.userId });
  };

  passport.use(new JwtStrategy(jwtStrategyOpts, jwtCbFunction));
  // this time don't next but instead add the comment
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    // unauthenticated
    if (error) {
      return res.status(401).json({
        message: info.message,
      });
    }
    // user is forbidden
    if (!user) {
      return res.status(403).json({
        message: info.message,
      });
    }

    // allow user to do operation
    next();
  })(req, res, next);
});
const userIdIsAlphanumeric = "should be alphanumeric.";
const userIdlength = "should be exactly 25 characters";

const userDeleterVc = [
  body("userId")
    .trim()
    .notEmpty()
    .withMessage(`userId ${empty}`)
    .isString()
    .withMessage(`userId ${stringCharacter}`)
    .isAlphanumeric()
    .withMessage(`userId ${userIdIsAlphanumeric}`)
    .isLength({ max: 25, min: 25 })
    .withMessage(`userId ${userIdlength}`),
];

const userDeleter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      userDeletionValidationError: errors.array(),
    });
  }

  const { userId } = req.body;
  const user = await db.user.getUserById(userId);

  if (!user) {
    throw new UserDoesNotExistError("user does not exist error");
  }

  if (user.member == null) {
    const postsIds = await db.post.getPostIdsByAuthorId(user.author.id);

    // delete user == author operation
    await db.user.deleteUserAuthor(postsIds, user);
  } else {
    // delete user == member operation
    await db.user.deleteUserMember(user);
  }
  res.json({ message: "user deleted" });
});

const userDelete = [
  authenticateUserJwtVc,
  authenticateUserJwt,
  userDeleterVc,
  userDeleter,
];

const tokenJWT = "should be a valid jwt";
const userGetterByTokenVc = [
  param("token")
    .trim()
    .notEmpty()
    .withMessage(`token ${emptyField}`)
    .isString()
    .withMessage(`token ${stringCharacter}`)
    .isJWT()
    .withMessage(`token ${tokenJWT}`),
];

const userGetterByToken = [
  userGetterByTokenVc,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorUserGetter: errors.array(),
      });
    }

    const { token } = req.params;
    const decodedPayload = jwt.decode(token);

    if (!decodedPayload) {
      return res.status(400).json({
        errorUserGetter: [],
        jwtValidity: "jwt invalid",
      });
    }

    const user = await db.user.getUserById(decodedPayload.userId);

    const userData = Object.assign(decodedPayload, user);

    res.json(userData);
  }),
];

// run validation chain
// if passed go to the next middleware
// if correct credentials give token to user member

export default {
  setUser: userSetter,
  getUserToken: userTokenGetter,
  logOutUser,
  deleteUser: userDelete,
  getUserByToken: userGetterByToken,
};
