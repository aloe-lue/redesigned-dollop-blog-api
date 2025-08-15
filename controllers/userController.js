import asyncHandler from "express-async-handler";
import { validationResult, body, header } from "express-validator";
import * as bcrypt from "bcrypt";
import db from "../prisma/query/index.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as LocalStrategy } from "passport-local";
import "dotenv/config";
import UserExistError from "../errors/userExistError.js";

// ! important => fix this login that can be accessed by user both member and author
// todo: make errors known handle next err that cuts through 404 not found or 500 internal server error

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

const postUserMemberVc = [
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
];

/**
 * add user member
 */
const userMemberAdder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      validationError: errors.array(),
    });
  }

  const { email, firstName, lastName, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.addUserMember(
    new Date(),
    email,
    firstName,
    lastName,
    username,
    hashedPassword
  );
  // 201 := created
  res.redirect(201, "/user/log_in");
});

/**
 * middleware for adding user member
 */
const postUserMember = [postUserMemberVc, userMemberAdder];

const localStrategy = new LocalStrategy(async (username, password, done) => {
  const user = await db.user.getUserByUsername(username);
  if (!user) {
    return done(null, false, { message: "Incorrect username" });
  }
  // compare user input password with  hashed user password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return done(null, false, { message: "Incorrect password" });
  }
  // send minimal data as paylaod to jwt
  return done(null, user.id);
});

passport.use(localStrategy);

const postUserLoginVC = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`username ${empty}`)
    .isLength({ min: 4, max: 32 })
    .withMessage(`username ${usernameLength}`)
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(`username ${username}`),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`password ${empty}`)
    .isStrongPassword()
    .withMessage(`password ${password}`)
    .isLength({ min: 8, max: 64 })
    .withMessage(`password ${passwordLength}`),
];

// use local strategy

const validationLogin = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      validationError: errors.array(),
    });
  }
  // validation passed
  next();
});

/**
 * give token to user
 */
const tokenForMember = asyncHandler(async (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info.message });
    }

    const jwtSecret = process.env.MEMBER_JWT_SECRET;
    const token = jwt.sign({ userId: user }, jwtSecret, {
      algorithm: "HS256",
      expiresIn: "15d",
    });

    // give token to user == member
    return res.json({ token });
  })(req, res);
});

// run validation chain
// if passed go to the next middleware
// if correct credentials give token to user member
const postUserMemberAuth = [postUserLoginVC, validationLogin, tokenForMember];

/***
 * make the same chains but very add additional fields
 * author password
 * get from env
 * independent hashed
 * verify hashed on other
 */
const authorPassword = "is a strong password.";
const authorPasswordHashed = "Incorrect author password";

const postUserAuthorVc = postUserMemberVc.slice();
postUserAuthorVc.push(
  body("authorPassword")
    .trim()
    .notEmpty()
    .withMessage(`author password ${empty}`)
    .isString()
    .withMessage(`author password ${stringCharacter}`)
    .isStrongPassword()
    .withMessage(`author password ${authorPassword}`)
    .isLength({ min: 8, max: 64 })
    .custom((value) => {
      const hashedAuthorPassword = process.env.AUTHOR_PASSWORD;
      const isMatch = bcrypt.compareSync(value, hashedAuthorPassword);
      return isMatch;
    })
    .withMessage(`${authorPasswordHashed}`)
);

const userAuthorAdder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      validationError: errors.array(),
    });
  }
  const { email, firstName, lastName, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.addUserAuthor(
    new Date(),
    email,
    firstName,
    lastName,
    username,
    hashedPassword
  );
  // 201 := created
  res.redirect(201, "/user/log_in/author");
});
/**
 * make sure author knows the author password
 * then add an author
 */
const postUserAuthor = [postUserAuthorVc, userAuthorAdder];

// same function different env value this is for author jwt token
const tokenForAuthor = asyncHandler(async (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info.message });
    }
    // you want to make use another jwt secret for this
    const jwtSecret = process.env.AUTHOR_JWT_SECRET;
    const token = jwt.sign({ userId: user }, jwtSecret, {
      algorithm: "HS256",
      expiresIn: "15d",
    });
    // give token user author
    res.json({ token });
  })(req, res);
});

const postUserAuthorAuth = [postUserLoginVC, validationLogin, tokenForAuthor];

export default {
  postUserMember,
  postUserMemberAuth,
  postUserAuthor,
  postUserAuthorAuth,
};
