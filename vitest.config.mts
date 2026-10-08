import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside Next's server bundle; use the empty module
      // Next resolves it to on the server.
      "server-only": path.resolve(
        import.meta.dirname,
        "node_modules/server-only/empty.js",
      ),
    },
  },
  test: {
    environment: "node",
    env: { DATABASE_URL: ":memory:" },
    setupFiles: ["test/setup-db.ts"],
  },
});
