import { Router } from "express";
import controller from "../controllers/indexController.js";

const posts = Router();

posts.get("/", controller.posts.getPosts);

export default posts;
