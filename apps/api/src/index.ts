import { apiEnv } from "./env";
import { createApp } from "./app";

const app = createApp();

Bun.serve({
  hostname: apiEnv.API_HOST,
  port: apiEnv.API_PORT,
  fetch: app.fetch
});

console.log(`GrubCheck API listening on http://${apiEnv.API_HOST}:${apiEnv.API_PORT}`);
