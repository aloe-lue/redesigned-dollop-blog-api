import { Router } from "express";
import controller from "../controllers/indexController.js";
const {
  postUserMember,
  postUserMemberAuth,
  postUserAuthor,
  postUserAuthorAuth,
} = controller.user;

const userRouter = Router();
// create user : member
userRouter.post("/sign_up", postUserMember);
userRouter.post("/log_in", postUserMemberAuth);

// create user : author
userRouter.post("/sign_up/author", postUserAuthor);
userRouter.post("/log_in/author", postUserAuthorAuth);

// create a log out that removes the token from the req.headers
// userRouter.get("/log_out", );

export default userRouter;
