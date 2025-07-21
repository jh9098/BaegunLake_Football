/* eslint-disable no-underscore-dangle */
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

clientsClaim();
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST || []);

// Push 이벤트 핸들
self.addEventListener("push", e => {
  const data = e.data?.json() || { title: "새 알림", body: "내용 없음" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png"
    })
  );
});
