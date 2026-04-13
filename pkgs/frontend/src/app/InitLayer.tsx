import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { type ReactNode, useEffect, useState, createContext } from "react";
import { auth, api } from "../utils/api";

const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";

export const UserContext = createContext<number | null>(null);

function getInitDataRaw(): string | undefined {
  try {
    const p = retrieveLaunchParams();
    return p.initDataRaw ?? undefined;
  } catch {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
    return tg?.initData;
  }
}

export default function InitLayer({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id: number } } } } }).Telegram?.WebApp;
    const uid = tg?.initDataUnsafe?.user?.id || 12345;
    setUserId(uid);

    if (skipAuth) {
      api.defaults.headers.common["x-user-id"] = String(uid);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    void (async () => {
      setStatus("loading");
      try {
        const raw = getInitDataRaw();
        if (!raw) throw new Error("no initData");
        await auth(raw);
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <div className="app-container" style={{ padding: 24, textAlign: "center" }}>
        Connecting…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="app-container" style={{ padding: 24, textAlign: "center" }}>
        Unauthorized
      </div>
    );
  }

  return <UserContext.Provider value={userId}>{children}</UserContext.Provider>;
}
