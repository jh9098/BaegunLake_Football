/**
 * React DOM 진입점 + PWA Push 구독 로직
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { subscribePush } from "./lib/push"; // VAPID 구독 유틸

/** ---------- React 렌더 ---------- */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

/** ---------- PWA Service Worker & Push 구독 ---------- */
if ("serviceWorker" in navigator) {
  // 디버그용 SW 메시지 콘솔 출력
  navigator.serviceWorker.addEventListener("message", event =>
    console.log("SW 메시지:", event.data)
  );

  /**
   * subscribePush()
   *  ‑ 등록된 SW 준비 완료 시 pushManager 구독 반환
   *  ‑ 이미 구독돼 있으면 그대로 재사용
   *  ‑ 신규 구독 시 VAPID public key 로 subscribe
   */
  subscribePush()
    .then(sub => {
      if (sub) {
        console.log("Push 구독 완료:", sub.endpoint);
        // TODO: fetch("/api/push/subscribe", { method: "POST", body: JSON.stringify(sub) })
      }
    })
    .catch(err => console.error("푸시 구독 실패:", err));
}
