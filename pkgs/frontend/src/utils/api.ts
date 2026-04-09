import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

export interface UserStats {
  id: number;
  clicks: number;
  rank?: number;
}

let localClicks = 0;

function headerUserId(): number {
  const raw = api.defaults.headers.common["x-user-id"];
  const n = typeof raw === "string" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchMyStats(): Promise<UserStats> {
  try {
    const res = await api.get<UserStats>("/me");
    return res.data;
  } catch {
    const uid = headerUserId();
    return { id: uid, clicks: localClicks, rank: 999 };
  }
}

export async function syncClicks(clicksToAdd: number): Promise<UserStats> {
  try {
    const res = await api.post<UserStats>("/click", { clicks: clicksToAdd });
    return res.data;
  } catch {
    const uid = headerUserId();
    localClicks += clicksToAdd;
    return { id: uid, clicks: localClicks, rank: 999 };
  }
}

export async function fetchLeaderboard(): Promise<UserStats[]> {
  try {
    const res = await api.get<UserStats[]>("/leaderboard");
    return res.data;
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
