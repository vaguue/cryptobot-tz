import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nodeEnv = process.env.NODE_ENV ?? "development";
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, `.env.${nodeEnv}`), override: true });

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  HTTP_PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().min(1),
  MONGO_DB_NAME: z.string().min(1).default("clicker"),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((s) => s.split(",").map((x) => x.trim())),
  SKIP_AUTH: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  /** Skip Telegram initData validation (local dev). Uses DEV_TELEGRAM_USER_ID. */
  SKIP_INIT_DATA: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  DEV_TELEGRAM_USER_ID: z.coerce.number().int().positive().default(12345),
  JWT_SECRET: z.string().min(8),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  MAX_CLICKS_PER_WINDOW: z.coerce.number().int().positive().default(120),
  CLICK_RATE_WINDOW_MS: z.coerce.number().int().positive().default(10_000),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid config:", parsed.error.flatten());
  process.exit(1);
}

const data = parsed.data;
if (!data.SKIP_AUTH) {
  if (!data.TELEGRAM_BOT_TOKEN && !data.SKIP_INIT_DATA) {
    console.error("TELEGRAM_BOT_TOKEN is required when SKIP_AUTH=false (unless SKIP_INIT_DATA=true)");
    process.exit(1);
  }
}

export type AppConfig = z.infer<typeof schema>;
export const config: AppConfig = data;
