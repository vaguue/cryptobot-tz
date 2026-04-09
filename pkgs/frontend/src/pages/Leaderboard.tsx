import { useEffect, useState } from "react";
import { fetchLeaderboard, type UserStats } from "../utils/api";
import "./Leaderboard.css";

interface LeaderboardProps {
  userId: number | null;
}

export default function Leaderboard({ userId }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchLeaderboard().then((data) => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading">Loading top 25...</div>;
  }

  return (
    <div className="leaderboard-page">
      <h1 className="title">Top 25 Leaders</h1>

      <div className="list-container">
        {leaders.map((user, index) => {
          const isMe = user.id === userId;
          return (
            <div key={`${user.id}-${index}`} className={`leader-row ${isMe ? "is-me" : ""}`}>
              <div className="rank">#{user.rank ?? index + 1}</div>
              <div className="user-info">
                {isMe ? "Me" : `User ${user.id.toString().slice(-4)}`}
              </div>
              <div className="clicks">{user.clicks.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
