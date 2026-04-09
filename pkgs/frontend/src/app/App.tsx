import { useEffect, useState } from "react";
import Home from "../pages/Home";
import Leaderboard from "../pages/Leaderboard";
import { api } from "../utils/api";

import HomeIcon from "../assets/home.svg?react";
import StatsIcon from "../assets/stats.svg?react";

const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";

const App = () => {
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const tg = (
      window as unknown as {
        Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id: number } } } };
      }
    ).Telegram?.WebApp;

    let uid = 12345;
    if (tg?.initDataUnsafe?.user?.id) {
      uid = tg.initDataUnsafe.user.id;
    }
    setUserId(uid);

    if (skipAuth) {
      api.defaults.headers.common["x-user-id"] = String(uid);
    }
  }, []);

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
