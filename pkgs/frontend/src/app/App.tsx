import { useState, useContext } from "react";
import Home from "../pages/Home";
import Leaderboard from "../pages/Leaderboard";
import { UserContext } from "./InitLayer";

import HomeIcon from "../assets/home.svg?react";
import StatsIcon from "../assets/stats.svg?react";

const App = () => {
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home");
  const userId = useContext(UserContext);

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
