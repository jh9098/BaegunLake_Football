// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path"; // resolve를 위해 path 모듈 import

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // 'prompt' 대신 'autoUpdate'로 변경하여 UX 개선
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: "백운호수 FC",
        short_name: "백운FC",
        description: "데이터로 증명하는 우리 아이의 성장",
        theme_color: "#ffffff",
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // 개발 중 라우팅 오류를 줄이기 위해 런타임 캐싱을 단순화
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    // alias 경로를 절대 경로로 수정하여 안정성 확보
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});