import { useState, type PointerEvent } from "react";
import CoinImg from "../assets/coin-blue.svg";
import "./ClickerButton.css";

interface ClickerButtonProps {
  onTap: (x: number, y: number) => void;
}

export function ClickerButton({ onTap }: ClickerButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onTap(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  return (
    <button
      type="button"
      className={`clicker-btn ${isPressed ? "pressed" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <img src={CoinImg} alt="" className="clicker-inner-img" draggable={false} />
    </button>
  );
}
