import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import HttpError from "../server/httpError.js";
import type { ApiResponse, AuthPayload } from "../server/http/types.js";
import { parseTelegramUserFromInitData } from "../telegram/validateInitData.js";

const initBodySchema = z.object({
  initData: z.string().min(1),
});

type TokenPayload = { data: AuthPayload };

export async function postAuthTelegram(
  req: Request,
  res: Response<ApiResponse<{ token: string }>>,
  next: NextFunction
): Promise<void> {
  try {
    const { initData } = initBodySchema.parse(req.body);
    const botToken = config.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new HttpError("Server misconfiguration: TELEGRAM_BOT_TOKEN", 500);
    }
    const user = parseTelegramUserFromInitData(initData, botToken);
    if (!user) {
      throw new HttpError("Invalid Telegram init data", 401);
    }

    const token = jwt.sign(
      { data: { userTgId: user.id } } satisfies TokenPayload,
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { token } });
  } catch (e) {
    next(e);
  }
}

export function getUnauth(_req: Request, res: Response<ApiResponse<null>>): void {
  res.clearCookie("auth_token");
  res.json({ success: true, data: null });
}
