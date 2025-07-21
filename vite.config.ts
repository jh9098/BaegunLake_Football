// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [
    react(),
    imagetools(), // 이미지 리사이즈 & srcset
    VitePWA({
      registerType: "autoUpdate",
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
      }
    })
  ]
});
