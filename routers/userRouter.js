import { Router } from "express";
import controller from "../controllers/indexController.js";
const { setUser, getUserToken, logOutUser, deleteUser, getUserByToken } =
  controller.user;

const userRouter = Router();
// create user
userRouter.get("/:token", getUserByToken);
userRouter.post("/sign_up", setUser);
userRouter.post("/log_in", getUserToken);
userRouter.get("/log_out", logOutUser);
userRouter.delete("/delete_user", deleteUser);

export default userRouter;
