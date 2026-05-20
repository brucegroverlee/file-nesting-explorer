/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Ship the icon themes alongside the webview bundle. The extension
    // exposes a single `localResourceRoots` (the dist dir), so any asset the
    // webview needs has to live under it after build.
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(dirname, "icons") + "/*",
          dest: "icons",
        },
      ],
    }),
  ],
  // Use relative asset paths so the webview can rewrite them via asWebviewUri.
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      // Consume the shared package directly from source so `vite dev` and
      // `vite build` don't depend on having built `packages/shared` first.
      // For tsc-based consumers (the extension) we use Project References
      // to ensure shared is built before they consume it.
      "@file-nesting/shared": path.resolve(
        dirname,
        "../shared/src/index.ts",
      ),
    },
  },
  build: {
    // Emit the built bundle inside the extension package so vsce (running
    // from packages/extension) picks it up via .vscodeignore -> dist/**.
    outDir: path.resolve(dirname, "../extension/dist/react-explorer"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
