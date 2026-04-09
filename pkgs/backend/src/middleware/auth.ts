import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import HttpError from "../server/httpError.js";
import type { AuthPayload, RecaptchaResponse } from "../server/http/types.js";
import logger from "../logger.js";

type JwtBody = { data: AuthPayload };

function extractBearer(authorization: string | undefined): string | undefined {
  if (!authorization?.startsWith("Bearer ")) return undefined;
  return authorization.slice(7);
}

async function verifyToken(token: string): Promise<JwtBody> {
  return new Promise((resolve, reject) =>
    jwt.verify(token, config.JWT_SECRET, (err, decoded) =>
      err ? reject(new HttpError("Invalid token", 403)) : resolve(decoded as JwtBody)
    )
  );
}

export async function authMiddleware(
  req: Request,
  res: Response<unknown, { userTgId: number }>,
  next: NextFunction
): Promise<void> {
  try {
    if (config.SKIP_AUTH) {
      const raw = req.headers["x-user-id"];
      const id = typeof raw === "string" ? Number(raw) : Number(raw?.[0]);
      if (!Number.isFinite(id) || id <= 0) {
        throw new HttpError("Missing or invalid X-User-Id", 401);
      }
      res.locals.userTgId = Math.trunc(id);
      next();
      return;
    }

    const token =
      (typeof req.cookies?.auth_token === "string" ? req.cookies.auth_token : undefined) ??
      extractBearer(req.headers.authorization);

    if (!token) {
      throw new HttpError("Unauthorized", 401);
    }

    const payload = await verifyToken(token);

    const recaptchaToken = req.headers["recaptcha-token"]?.toString();
    if (recaptchaToken && config.RECAPTCHA_SECRET_KEY) {
      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
      try {
        const response = await axios.post<RecaptchaResponse>(url);
        if (response.data.success) {
          logger.info("recaptcha ok", { score: response.data.score });
        }
      } catch (e) {
        logger.warn("recaptcha verify failed", e);
      }
    }

    res.locals.userTgId = payload.data.userTgId;
    next();
  } catch (err) {
    next(err);
  }
}
