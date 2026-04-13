import cors from "cors";
import express from "express";
import { config } from "../config.js";
import { errorMiddleware } from "./middlewares.js";
import { createRouter } from "./router.js";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "32kb" }));
  app.use(
    cors({
      origin: config.ALLOWED_ORIGINS,
    })
  );

  app.use("/api", createRouter());

  app.use(errorMiddleware);
  return app;
}
