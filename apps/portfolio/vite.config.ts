import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@portfolio/db/client": fileURLToPath(
        new URL("../../packages/db/src/client.ts", import.meta.url),
      ),
    },
  },
  server: {
    // 0.0.0.0 via VITE_DEV_HOST when the dev server runs inside Docker
    host: process.env.VITE_DEV_HOST || "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4273,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router")) return "routing";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
            return "react-core";
          }
          if (
            id.includes("/motion/") ||
            id.includes("/framer-motion/") ||
            id.includes("/motion-dom/") ||
            id.includes("/motion-utils/")
          ) {
            return "motion";
          }
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("@radix-ui")) return "ui-primitives";
          if (
            id.includes("/jspdf/") ||
            id.includes("/fflate/") ||
            id.includes("/fast-png/") ||
            id.includes("/@babel/runtime/") ||
            id.includes("/canvg/") ||
            id.includes("/dompurify/") ||
            id.includes("/html2canvas/")
          ) {
            return "pdf-export";
          }
          return "vendor";
        },
      },
    },
  },
});
