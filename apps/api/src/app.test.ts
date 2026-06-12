import { afterEach, describe, expect, test } from "bun:test";
import { resetDb } from "@grubcheck/db";
import { createApp } from "./app";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl) {
    process.env.DATABASE_URL = originalDatabaseUrl;
  } else {
    delete process.env.DATABASE_URL;
  }

  resetDb();
});

describe("api fallback routes", () => {
  test("returns fallback catalog when the database is not configured", async () => {
    delete process.env.DATABASE_URL;
    resetDb();
    const app = createApp();
    const response = await app.fetch(new Request("http://localhost/api/catalog/items"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test("returns biome presets", async () => {
    delete process.env.DATABASE_URL;
    resetDb();
    const app = createApp();
    const response = await app.fetch(new Request("http://localhost/api/biomes"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.map((biome: { key: string }) => biome.key)).toEqual([
      "neutral",
      "forest",
      "desert",
      "snow"
    ]);
  });
});
