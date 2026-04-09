import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

export interface UserStats {
  id: number;
  clicks: number;
  rank?: number;
}

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; message: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

let localClicks = 0;

function headerUserId(): number {
  const raw = api.defaults.headers.common["x-user-id"];
  const n = typeof raw === "string" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success) {
    throw new Error(body.message);
  }
  return body.data;
}

/** POST /auth — `initData` in body; JWT returned in JSON and sent as `Authorization: Bearer` on later requests. */
export async function auth(initData: string): Promise<void> {
  const res = await api.post<ApiSuccess<{ token: string }> | ApiFailure>("/auth", { initData });
  if (!res.data.success) {
    throw new Error(res.data.message);
  }
  api.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;
}

export async function fetchMyStats(): Promise<UserStats> {
  try {
    const res = await api.get<ApiResponse<UserStats>>("/me");
    return unwrap(res.data);
  } catch {
    const uid = headerUserId();
    return { id: uid, clicks: localClicks, rank: 999 };
  }
}

export async function syncClicks(clicksToAdd: number): Promise<UserStats> {
  try {
    const res = await api.post<ApiResponse<UserStats>>("/click", { clicks: clicksToAdd });
    return unwrap(res.data);
  } catch {
    const uid = headerUserId();
    localClicks += clicksToAdd;
    return { id: uid, clicks: localClicks, rank: 999 };
  }
}

export async function fetchLeaderboard(): Promise<UserStats[]> {
  try {
    const res = await api.get<ApiResponse<UserStats[]>>("/leaderboard");
    return unwrap(res.data);
  } catch {
    const uid = headerUserId();
    const rows = [
      { id: 1, clicks: 1_000_000, rank: 1 },
      { id: 2, clicks: 500_000, rank: 2 },
      { id: 3, clicks: 250_000, rank: 3 },
      { id: uid, clicks: localClicks, rank: 999 },
    ];
    return rows
      .sort((a, b) => b.clicks - a.clicks)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }
}
