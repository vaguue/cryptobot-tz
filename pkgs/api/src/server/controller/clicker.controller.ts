import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { assertClickBudget } from "../../services/clickRateLimiter.js";
import { UserService } from "../../services/userService.js";
import type { ApiResponse, UserStatsPayload, PaginatedData } from "../http/types.js";

const clickBodySchema = z.object({
  clicks: z.coerce.number().int().min(1).max(5000),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
});

const users = new UserService();

export async function getMe(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = res.locals.userTgId;
    const me = await users.getMe(id);
    const body: ApiResponse<UserStatsPayload> = { success: true, data: me };
    res.json(body);
  } catch (e) {
    next(e);
  }
}

export async function postClick(req: Request, res: Response, next: NextFunction): Promise<void> {
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
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = res.locals.userTgId;
    const { page, limit } = paginationQuerySchema.parse(req.query);
    const data = await users.getLeaderboard(id, page, limit);
    const body: ApiResponse<PaginatedData<UserStatsPayload>> = { success: true, data };
    res.json(body);
  } catch (e) {
    next(e);
  }
}
