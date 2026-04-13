import { Router } from "express";
import { getUnauth, postAuth } from "./controller/auth.controller.js";
import { getLeaderboard, getMe, postClick } from "./controller/clicker.controller.js";
import { authMiddleware } from "./middlewares.js";

export function createRouter(): Router {
  const router = Router();

  // Public routes
  router.post("/auth", postAuth);
  router.get("/unauth", getUnauth);

  // Protected routes
  const protectedRouter = Router();
  protectedRouter.use(authMiddleware);

  protectedRouter.get("/me", getMe);
  protectedRouter.post("/click", postClick);
  protectedRouter.get("/leaderboard", getLeaderboard);

  router.use("/", protectedRouter);

  return router;
}
