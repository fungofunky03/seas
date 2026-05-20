import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: ".",
    test: {
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["client/src/**/*.{ts,tsx}", "shared/**/*.ts"],
        exclude: ["client/src/main.tsx", "client/src/components/ui/**/*"],
      },
    },
  }),
);
