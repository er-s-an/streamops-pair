import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { streamopsApi } from "./src/server/devApi";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), streamopsApi(env)],
    server: { host: "127.0.0.1", port: 5173 },
  };
});
