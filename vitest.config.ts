import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    // Cast avoids a TS-only clash between the two `vite` copies present
    // (one pulled by Next, one by Vitest); runtime is unaffected.
    plugins: [react() as never],
    test: {
        globals: true,
        // Default to node; component tests opt into jsdom via a per-file
        // `// @vitest-environment jsdom` comment.
        environment: "node",
        setupFiles: ["./vitest.setup.ts"],
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
});
