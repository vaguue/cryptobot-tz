import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";
import HttpError from "../server/httpError.js";
import type { ApiFailure, ApiSuccessMessage, AuthPayload, InitDataBody } from "../server/http/types.js";
import { oCookies } from "../server/http/types.js";
import { initDataSchema } from "../server/http/schemas.js";
import { parseTelegramUserFromInitData } from "../telegram/validateInitData.js";

function cookieOptions(expires: Date): {
  expires: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "none";
} {
  const prod = config.NODE_ENV === "production";
  return {
    expires,
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
  };
}

export async function postAuth(
  req: Request<unknown, unknown, InitDataBody>,
  res: Response<ApiSuccessMessage | ApiFailure>,
  next: NextFunction
): Promise<void> {
  try {
    let telegramId: number;

    if (config.SKIP_INIT_DATA) {
      telegramId = config.DEV_TELEGRAM_USER_ID;
    } else {
      const { initData } = initDataSchema.parse(req.body);
      const botToken = config.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        throw new HttpError("Server misconfiguration: TELEGRAM_BOT_TOKEN", 500);
      }
      const user = parseTelegramUserFromInitData(initData, botToken);
      if (!user) {
        throw new HttpError("invalid initData", 400);
      }
      telegramId = user.id;
    }

    const now = new Date();
    await User.findOneAndUpdate(
      { telegramId },
      { $setOnInsert: { telegramId, clicks: 0, updatedAt: now } },
      { upsert: true }
    );

    const expire = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const payload: { exp: number; data: AuthPayload } = {
      exp: Math.floor(expire.getTime() / 1000),
      data: { userTgId: telegramId },
    };
    const token = jwt.sign(payload, config.JWT_SECRET);

    res.cookie(oCookies.auth, token, cookieOptions(expire));
    res.json({ success: true, message: "user authenticated" });
  } catch (e) {
    next(e);
  }
}

export function getUnauth(
  _req: Request,
  res: Response<ApiSuccessMessage | ApiFailure>
): void {
  res.clearCookie(oCookies.auth);
  res.json({ success: true, message: "auth token cleared" });
}
