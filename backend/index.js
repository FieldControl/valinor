import express from "express";
import { movieRouter } from "./routes/movieRoutes.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(movieRouter);

app.listen(8080, () => {
  console.log("API listening on 8080");
});
