import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { oCookies } from "../server/http/types.js";
import HttpError from "../server/httpError.js";
import type { AuthPayload, RecaptchaResponse } from "../server/http/types.js";
import logger from "../logger.js";

type JwtBody = { exp?: number; data: AuthPayload };

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

function readXUserId(req: Request): number | null {
  const raw = req.headers["x-user-id"];
  const id = typeof raw === "string" ? Number(raw) : Number(raw?.[0]);
  if (!Number.isFinite(id) || id <= 0) return null;
  return Math.trunc(id);
}

function readJwt(req: Request): string | undefined {
  return (
    (typeof req.cookies?.[oCookies.auth] === "string" ? req.cookies[oCookies.auth] : undefined) ??
    extractBearer(req.headers.authorization)
  );
}

async function applyRecaptchaIfPresent(req: Request): Promise<void> {
  const recaptchaToken = req.headers["recaptcha-token"]?.toString();
  if (!recaptchaToken || !config.RECAPTCHA_SECRET_KEY) return;
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

export async function authMiddleware(
  req: Request,
  res: Response<unknown, { userTgId: number }>,
  next: NextFunction
): Promise<void> {
  try {
    if (config.SKIP_AUTH) {
      const fromHeader = readXUserId(req);
      if (fromHeader !== null) {
        res.locals.userTgId = fromHeader;
        next();
        return;
      }
    } else {
      const spoof = readXUserId(req);
      if (spoof !== null) {
        logger.warn("ignored X-User-Id when SKIP_AUTH=false");
      }
    }

    const token = readJwt(req);
    if (!token) {
      throw new HttpError("Unauthorized", 401);
    }

    const payload = await verifyToken(token);
    await applyRecaptchaIfPresent(req);
    res.locals.userTgId = payload.data.userTgId;
    next();
  } catch (err) {
    next(err);
  }
}
