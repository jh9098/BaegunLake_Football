// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // <-- 이 줄이 반드시 있어야 합니다!
import { subscribePush } from "./lib/push";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA 서비스워커 및 push 구독
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", event =>
    console.log("SW 메시지:", event.data)
  );
  subscribePush()
    .then(sub => {
      if (sub) {
        console.log("Push 구독 완료:", sub.endpoint);
      }
    })
    .catch(err => console.error("푸시 구독 실패:", err));
}