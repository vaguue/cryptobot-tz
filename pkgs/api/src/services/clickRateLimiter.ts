import { config } from "../config.js";
import HttpError from "../server/errors/httpError.js";

type Bucket = { windowStart: number; count: number };

const buckets = new Map<number, Bucket>();

setInterval(() => {
  const now = Date.now();
  const windowMs = config.CLICK_RATE_WINDOW_MS;
  for (const [userId, b] of buckets.entries()) {
    if (now - b.windowStart > windowMs) {
      buckets.delete(userId);
    }
  }
}, Math.max(10000, config.CLICK_RATE_WINDOW_MS)).unref();

export function assertClickBudget(userId: number, clicks: number): void {
  const now = Date.now();
  const windowMs = config.CLICK_RATE_WINDOW_MS;
  const max = config.MAX_CLICKS_PER_WINDOW;

  let b = buckets.get(userId);
  if (!b || now - b.windowStart > windowMs) {
    b = { windowStart: now, count: 0 };
    buckets.set(userId, b);
  }

  if (b.count + clicks > max) {
    throw new HttpError("Rate limit exceeded", 429);
  }
  b.count += clicks;
}
