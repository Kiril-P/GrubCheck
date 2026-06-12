import { getDb, listInternalStatus } from "@grubcheck/db";
import { Hono } from "hono";
import {
  snapshotSteamPrices,
  syncAssets,
  syncSteamMarketCatalog
} from "@grubcheck/worker";
import { getFallbackStatus } from "../lib/fallback";

const withDatabase = async <T>(handler: () => Promise<T>) => {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL is required for internal job execution.");
  }

  return handler();
};

export const internalRoutes = new Hono()
  .get("/status", async (context) => {
    const db = getDb();

    return context.json(db ? await listInternalStatus(db) : getFallbackStatus());
  })
  .post("/sync/steam-market", async (context) => {
    try {
      return context.json(await withDatabase(syncSteamMarketCatalog));
    } catch (error) {
      return context.json(
        { error: error instanceof Error ? error.message : "Unable to run steam market sync." },
        400
      );
    }
  })
  .post("/sync/assets", async (context) => {
    try {
      return context.json(await withDatabase(syncAssets));
    } catch (error) {
      return context.json(
        { error: error instanceof Error ? error.message : "Unable to run asset sync." },
        400
      );
    }
  })
  .post("/sync/prices", async (context) => {
    try {
      return context.json(await withDatabase(snapshotSteamPrices));
    } catch (error) {
      return context.json(
        { error: error instanceof Error ? error.message : "Unable to run price sync." },
        400
      );
    }
  });

