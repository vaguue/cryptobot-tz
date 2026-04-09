import crypto from "node:crypto";

/**
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function parseTelegramUserFromInitData(
  initData: string,
  botToken: string
): { id: number } | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  const entries: [string, string][] = [];
  for (const [k, v] of params.entries()) {
    if (k !== "hash") entries.push([k, v]);
  }
  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (calculated !== hash) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson) as { id?: number };
    if (typeof user.id !== "number") return null;
    return { id: user.id };
  } catch {
    return null;
  }
}
