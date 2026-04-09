import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getUnauth, postAuth } from "../controllers/auth.controller.js";
import { config } from "../config.js";
import { authMiddleware } from "../middleware/auth.js";
import { createClickerRouter } from "../routes/clicker.js";
import { errorMiddleware } from "./errorMiddleware.js";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "32kb" }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
    })
  );

  app.post("/api/auth", postAuth);
  app.get("/api/unauth", getUnauth);

  const protectedApi = express.Router();
  protectedApi.use(authMiddleware);
  protectedApi.use(createClickerRouter());
  app.use("/api", protectedApi);

  app.use(errorMiddleware);
  return app;
}
