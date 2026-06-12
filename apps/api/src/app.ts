import { Hono } from "hono";
import { cors } from "hono/cors";
import { biomeRoutes } from "./routes/biomes";
import { catalogRoutes } from "./routes/catalog";
import { internalRoutes } from "./routes/internal";

export const createApp = () => {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "OPTIONS"]
    })
  );

  app.get("/health", (context) =>
    context.json({
      ok: true,
      service: "grubcheck-api"
    })
  );
  app.route("/api/catalog", catalogRoutes);
  app.route("/api/biomes", biomeRoutes);
  app.route("/internal", internalRoutes);

  return app;
};

