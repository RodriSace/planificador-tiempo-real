/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base: "./" hace que los assets sean relativos y funcionen en GitHub Pages
// bajo un subdirectorio (https://usuario.github.io/rt-scheduler-sim/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
