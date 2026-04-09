import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import InitLayer from "./InitLayer";
import "./global.css";

const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void } } })
  .Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InitLayer>
      <App />
    </InitLayer>
  </React.StrictMode>
);
