import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "logo.jpg", "robots.txt", "sitemap.xml"],
      manifest: {
        name: "Semester Average Workspace",
        short_name: "CookedCalc",
        description:
          "A semester-grade workspace that lets you manage multiple scenarios, save and reuse templates, and keep everything stored locally.",
        theme_color: "#0E0E0E",
        background_color: "#0E0E0E",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "logo-192x192.jpg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "logo-512x512.jpg",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      },
    }),
  ],
});
