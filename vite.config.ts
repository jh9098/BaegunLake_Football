/**
 * Vite 설정 – React + Tailwind + 이미지툴즈 + PWA(Service Worker + 푸시)
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    /** React 18 Fast Refresh */
    react(),

    /** 이미지 리사이즈·WebP/AVIF srcset 생성 */
    imagetools(),

    /** PWA 플러그인 – Service Worker + Manifest 자동 생성 */
    VitePWA({
      /** 'prompt' : 새 버전 발견 시 브라우저가 업데이트 배너 표시  */
      registerType: "prompt",

      /** dev 모드에서도 SW 작동하도록 */
      devOptions: { enabled: true },

      /** 웹앱 매니페스트 */
      manifest: {
        name: "Soccer Club",
        short_name: "Soccer",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ],
        start_url: "/",
        display: "standalone",
        theme_color: "#2563eb",
        background_color: "#ffffff"
      },

      /** Workbox 설정 – 정적 프리캐싱 + 런타임 캐시 */
      workbox: {
        /** 빌드 산출물 중 프리캐시할 패턴 */
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,avif}"],

        /** 런타임 이미지 CacheFirst */
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "images" }
          }
        ]
      }
    })
  ],

  /** 별칭(@ → src) – tsconfig.json paths 와 맞춰줌 */
  resolve: {
    alias: { "@": "/src" }
  }
});
