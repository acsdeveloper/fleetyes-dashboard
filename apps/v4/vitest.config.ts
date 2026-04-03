/**
 * Vitest configuration for FleetYes API unit & integration tests.
 * Uses the 'node' environment for API-layer tests (no jsdom needed).
 */
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals:     true,
    include:     ["__tests__/**/*.test.ts"],
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
