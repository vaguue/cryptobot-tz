import { useCallback, useEffect, useRef, useState } from "react";
import { ClickerButton } from "../components/ClickerButton";
import { fetchMyStats, syncClicks } from "../utils/api";
import "./Home.css";

interface FloatingText {
  id: number;
  x: number;
  y: number;
}

interface HomeProps {
  userId: number | null;
}

export default function Home({ userId }: HomeProps) {
  const [clicks, setClicks] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const clickBuffer = useRef(0);
  const textIdCounter = useRef(0);

  useEffect(() => {
    void fetchMyStats().then((stats) => setClicks(stats.clicks));
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (clickBuffer.current > 0) {
        const toSync = clickBuffer.current;
        clickBuffer.current = 0;
        void syncClicks(toSync).then((stats) => setClicks(stats.clicks));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTap = useCallback((x: number, y: number) => {
    setClicks((c) => c + 1);
    clickBuffer.current += 1;

    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { impactOccurred: (s: string) => void } } } })
      .Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred("light");

    const id = textIdCounter.current++;
    setFloatingTexts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  }, []);

  return (
    <div className="home-page">
      <div className="score-board">
        <div className="score-label">Balance</div>
        <div className="score-value">{clicks.toLocaleString()}</div>
      </div>

      <div className="clicker-container">
        <ClickerButton onTap={handleTap} />
      </div>

      {floatingTexts.map((t) => (
        <div key={t.id} className="floating-text" style={{ left: t.x, top: t.y }}>
          +1
        </div>
      ))}
    </div>
  );
}
