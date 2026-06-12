import { getDb, getCatalogItemDetailBySlug, listPublishedCatalogItems } from "@grubcheck/db";
import { Hono } from "hono";
import { z } from "zod";
import { getFallbackCatalogDetail, listFallbackCatalog } from "../lib/fallback";

const querySchema = z.object({
  q: z.string().optional(),
  slot: z.enum(["head", "face", "torso", "hands", "legs", "feet", "back"]).optional(),
  page: z.coerce.number().int().nonnegative().optional(),
  pageSize: z.coerce.number().int().positive().max(60).optional()
});

export const catalogRoutes = new Hono()
  .get("/items", async (context) => {
    const parsed = querySchema.parse({
      q: context.req.query("q") ?? undefined,
      slot: context.req.query("slot") ?? undefined,
      page: context.req.query("page") ?? undefined,
      pageSize: context.req.query("pageSize") ?? undefined
    });
    const query = {
      ...(parsed.q ? { q: parsed.q } : {}),
      ...(parsed.slot ? { slot: parsed.slot } : {}),
      ...(parsed.page !== undefined ? { page: parsed.page } : {}),
      ...(parsed.pageSize !== undefined ? { pageSize: parsed.pageSize } : {})
    };
    const db = getDb();

    if (!db) {
      return context.json(listFallbackCatalog(query));
    }

    return context.json(await listPublishedCatalogItems(db, query));
  })
  .get("/items/:slug", async (context) => {
    const slug = context.req.param("slug");
    const db = getDb();

    const detail = db
      ? await getCatalogItemDetailBySlug(db, slug)
      : getFallbackCatalogDetail(slug);

    if (!detail) {
      return context.json({ error: "Not found" }, 404);
    }

    return context.json(detail);
  });
