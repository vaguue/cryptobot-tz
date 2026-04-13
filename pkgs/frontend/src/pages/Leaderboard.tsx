import { useEffect, useState } from "react";
import { fetchLeaderboard, type UserStats, type PaginatedData } from "../utils/api";
import "./Leaderboard.css";

interface LeaderboardProps {
  userId: number | null;
}

export default function Leaderboard({ userId }: LeaderboardProps) {
  const [data, setData] = useState<PaginatedData<UserStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(page, limit).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [page]);

  if (loading && !data) {
    return <div className="loading">Loading leaders...</div>;
  }

  const rows = data?.rows || [];
  const totalPages = data?.totalPages || 1;
  const me = data?.me;

  // Check if "Me" is already in the currently displayed rows
  const isMeInView = rows.some((r) => r.id === userId);

  return (
    <div className="leaderboard-page">
      <h1 className="title">Top Leaders</h1>

      <div className="list-container">
        {rows.map((user, index) => {
          const isMe = user.id === userId;
          return (
            <div key={`${user.id}-${index}`} className={`leader-row ${isMe ? "is-me" : ""}`}>
              <div className="rank">#{user.rank ?? (page - 1) * limit + index + 1}</div>
              <div className="user-info">
                {isMe ? "Me" : `User ${user.id.toString().slice(-4)}`}
              </div>
              <div className="clicks">{user.clicks.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {!isMeInView && me && (
        <>
          <div className="me-separator">
            <span>• • •</span>
          </div>
          <div className="list-container sticky-me">
            <div className="leader-row is-me">
              <div className="rank">#{me.rank}</div>
              <div className="user-info">Me</div>
              <div className="clicks">{me.clicks.toLocaleString()}</div>
            </div>
          </div>
        </>
      )}

      <div className="pagination">
        <button 
          disabled={page <= 1 || loading} 
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="page-info">
          Page {page} of {totalPages}
        </span>
        <button 
          disabled={page >= totalPages || loading} 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
