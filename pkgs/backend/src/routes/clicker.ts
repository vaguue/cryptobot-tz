import { Router } from "express";
import { z } from "zod";
import { assertClickBudget } from "../services/clickRateLimiter.js";
import { UserService } from "../services/userService.js";
import type { ApiResponse } from "../server/http/types.js";
import type { UserStatsPayload } from "./types.js";

const clickBodySchema = z.object({
  clicks: z.coerce.number().int().min(1).max(5000),
});

const users = new UserService();

export function createClickerRouter(): Router {
  const r = Router();

  r.get("/me", async (_req, res, next) => {
    try {
      const id = res.locals.userTgId;
      const me = await users.getMe(id);
      const body: ApiResponse<UserStatsPayload> = { success: true, data: me };
      res.json(body);
    } catch (e) {
      next(e);
    }
  });

  r.post("/click", async (req, res, next) => {
    try {
      const id = res.locals.userTgId;
      const { clicks } = clickBodySchema.parse(req.body);
      assertClickBudget(id, clicks);
      const doc = await users.addClicks(id, clicks);
      const rank = await users.getRank(id);
      const payload: UserStatsPayload = { id: doc.telegramId, clicks: doc.clicks, rank };
      const body: ApiResponse<UserStatsPayload> = { success: true, data: payload };
      res.json(body);
    } catch (e) {
      next(e);
    }
  });

  r.get("/leaderboard", async (_req, res, next) => {
    try {
      const id = res.locals.userTgId;
      const rows = await users.getLeaderboard(id);
      const body: ApiResponse<typeof rows> = { success: true, data: rows };
      res.json(body);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
