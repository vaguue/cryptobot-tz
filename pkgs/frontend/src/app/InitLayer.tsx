import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { type ReactNode, useEffect, useState } from "react";
import { auth } from "../utils/api";

const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";

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
    skipAuth ? "ready" : "idle"
  );

  useEffect(() => {
    if (skipAuth) return;

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

  if (skipAuth) {
    return <>{children}</>;
  }

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

  return <>{children}</>;
}
