import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "istanbul" as const,
      enabled: true,
    },
  },
});
