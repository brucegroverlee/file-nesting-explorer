import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative asset paths so the webview can rewrite them via asWebviewUri.
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Emit the built bundle at the extension root so it ships in the .vsix
    // (src/** is excluded by .vscodeignore, but dist/** is not).
    outDir: path.resolve(__dirname, "../../dist/react-explorer"),
    emptyOutDir: true,
    sourcemap: false,
    // A single CSS/JS pair keeps the webview HTML rewriter simple.
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
