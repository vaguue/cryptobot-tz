import { useEffect, useState } from "react";
import Home from "../pages/Home";
import Leaderboard from "../pages/Leaderboard";
import { api, authenticateWithTelegram } from "../utils/api";

import HomeIcon from "../assets/home.svg?react";
import StatsIcon from "../assets/stats.svg?react";

const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";

const App = () => {
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home");
  const [userId, setUserId] = useState<number | null>(null);
  const [authReady, setAuthReady] = useState(skipAuth);

  useEffect(() => {
    const tg = (
      window as unknown as {
        Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id: number } }; initData?: string } };
      }
    ).Telegram?.WebApp;

    let uid = 12345;
    if (tg?.initDataUnsafe?.user?.id) {
      uid = tg.initDataUnsafe.user.id;
    }
    setUserId(uid);

    void (async () => {
      if (skipAuth) {
        api.defaults.headers.common["x-user-id"] = String(uid);
        setAuthReady(true);
        return;
      }

      const initData = tg?.initData;
      if (!initData) {
        console.warn("Telegram initData missing; cannot authenticate");
        setAuthReady(true);
        return;
      }
      try {
        await authenticateWithTelegram(initData);
      } catch (e) {
        console.error("Auth failed", e);
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  if (!authReady) {
    return (
      <div className="app-container" style={{ padding: 24, textAlign: "center" }}>
        Connecting…
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="content">
        {activeTab === "home" ? (
          <Home userId={userId} />
        ) : (
          <Leaderboard userId={userId} />
        )}
      </div>

      <nav className="bottom-nav">
        <button
          type="button"
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          <HomeIcon className="nav-icon" />
          <span>Clicker</span>
        </button>
        <button
          type="button"
          className={activeTab === "leaderboard" ? "active" : ""}
          onClick={() => setActiveTab("leaderboard")}
        >
          <StatsIcon className="nav-icon" />
          <span>Top 25</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
