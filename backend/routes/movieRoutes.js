import express from "express";
import controller from "../controller/movieController.js";
const app = express();
app.use(express.json());

app.get("/api/v1/movie/:title", controller.getMovies);
app.get("/api/v1/movie/id/:id", controller.getById);

export { app as movieRouter };
