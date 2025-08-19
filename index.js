import express from "express";
import "dotenv/config";
import helmet from "helmet";
import routes from "./routers/indexRouter.js";
import cors from "cors";

const app = express();
app.use(helmet());
// reduce fingerprint
app.disable("x-powered-by");

app.use(express.urlencoded({ extended: false }));
const corsOptions = {
  // hmm don't put it now
  // origin: "http://localhost:5000",
  optionsSuccessStatus: 200,
};
const corsEnabled = cors(corsOptions);

app.options("/api/v1/posts", corsEnabled);
app.options("/api/v1/user", corsEnabled);
app.options("*splat", corsEnabled);

app.use("/api/v1/posts", corsEnabled, routes.posts);
app.use("/api/v1/user", corsEnabled, routes.user);

// 404 now found
app.use("*splat", (req, res, next) => {
  res.status(404).json({
    message: "Not Found",
  });
});

app.use((error, req, res, next) => {
  console.log(error);

  res.status(error.statusCode || 500).json(error.message);
});

const PORT = Number(process.env.LOCAL_PORT) || 3000;

app.listen(PORT, (err) => {
  console.log(`The server is running at port ${PORT}.`);
});
