import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import logger from "../logger.js";
import HttpError from "./httpError.js";
import type { ApiFailure } from "./http/types.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response<ApiFailure>,
  _next: NextFunction
): void {
  logger.error(err instanceof Error ? err : new Error(String(err)));

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "invalid request",
    });
    return;
  }
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}
