import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// Only public catalog tables are cached by the service worker. Private tables (user_collection,
// collection_shares, profiles) and auth calls are never cached, so one user's data cannot be
// served to another user on the same browser.
const PUBLIC_TABLES = /^\/rest\/v1\/(products|categories|sets|exchange_rates|product_prices)$/;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseOrigin = env.VITE_SUPABASE_URL ? new URL(env.VITE_SUPABASE_URL).origin : "";

  return {
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            query: ["@tanstack/react-query"],
            supabase: ["@supabase/supabase-js"],
            icons: ["lucide-react"],
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "prompt", // the app shows a "new version available" bar instead of reloading silently
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          id: "/",
          name: "Steelvault",
          short_name: "Steelvault",
          description: "Catalog and manage your steelbook and video game collection.",
          lang: "en",
          display: "standalone",
          start_url: "/",
          scope: "/",
          theme_color: "#0b1220",
          background_color: "#0b1220",
          categories: ["entertainment", "lifestyle"],
          icons: [
            { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
            { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
          shortcuts: [
            { name: "Catalog", url: "/" },
            { name: "My collection", url: "/collection" },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url, request }) => url.origin === supabaseOrigin && request.method === "GET" && PUBLIC_TABLES.test(url.pathname),
              handler: "NetworkFirst",
              options: {
                cacheName: "catalog-api",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 150, maxAgeSeconds: 7 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === supabaseOrigin && url.pathname.startsWith("/storage/v1/") && url.pathname.includes("/product-images/"),
              handler: "CacheFirst",
              options: {
                cacheName: "product-images",
                expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  };
});
