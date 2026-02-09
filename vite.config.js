import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.jfif", "robots.txt", "sitemap.xml"],
      manifest: {
        name: "Semester Average Calculator",
        short_name: "Semester Avg",
        description:
          "Calculate your weighted semester average easily. Input module grades, coefficients, and weights to track your academic performance.",
        theme_color: "#171717",
        background_color: "#171717",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon.jfif",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "icon.jfif",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      },
    }),
  ],
});
