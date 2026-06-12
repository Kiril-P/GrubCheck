import {
  type CatalogItem,
  type CatalogItemDetail,
  type CatalogListResponse,
  type InternalStatus,
  type MatchReview,
  type RenderManifest,
  type SyncJob,
  type SyncRun
} from "@grubcheck/domain";
import { and, count, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";
import type { Database } from "./client";
import {
  catalogItems,
  matchReviews,
  marketItemsRaw,
  priceSnapshots,
  renderModels,
  skinVariants,
  syncRuns
} from "./schema";

const mapCatalogItem = (
  item: typeof catalogItems.$inferSelect,
  latestPrice?: typeof priceSnapshots.$inferSelect | null
): CatalogItem => ({
  id: item.id,
  slug: item.slug,
  displayName: item.displayName,
  baseTemplate: item.baseTemplate,
  itemKind: item.itemKind,
  renderTarget: item.renderTarget,
  slot: item.slot ?? null,
  layerOrder: item.layerOrder,
  published: item.published,
  emissive: item.emissive,
  marketHashName: item.marketHashName,
  iconUrl: item.iconUrl ?? undefined,
  latestPrice: latestPrice
    ? {
        source: latestPrice.source,
        currency: latestPrice.currency,
        priceMinor: latestPrice.priceMinor ?? null,
        listings: latestPrice.listings ?? null,
        capturedAt: latestPrice.capturedAt.toISOString()
      }
    : null,
  priceUpdatedAt: latestPrice?.capturedAt.toISOString() ?? null
});

const mapRenderManifest = (
  item: typeof catalogItems.$inferSelect,
  variant: typeof skinVariants.$inferSelect,
  renderModel: typeof renderModels.$inferSelect
): RenderManifest => ({
  renderModelId: renderModel.id,
  slot: renderModel.slot,
  layerOrder: item.layerOrder,
  skeletonProfile: renderModel.skeletonProfile,
  bodyMasks: renderModel.bodyMasks,
  suppressesSlots: renderModel.suppressesSlots,
  glbUrl: variant.glbUrl ?? renderModel.defaultGlbUrl ?? undefined,
  textureSet: {
    ...renderModel.defaultTextureSet,
    ...variant.textureSet
  },
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  emissiveEnabled: item.emissive || Boolean(variant.textureSet.emissiveUrl)
});

const hydrateLatestPrices = async (db: Database, itemIds: string[]) => {
  if (!itemIds.length) {
    return new Map<string, typeof priceSnapshots.$inferSelect>();
  }

  const rows = await db
    .select()
    .from(priceSnapshots)
    .where(inArray(priceSnapshots.catalogItemId, itemIds))
    .orderBy(desc(priceSnapshots.capturedAt));

  return rows.reduce((map, row) => {
    if (!map.has(row.catalogItemId)) {
      map.set(row.catalogItemId, row);
    }

    return map;
  }, new Map<string, typeof priceSnapshots.$inferSelect>());
};

export const listPublishedCatalogItems = async (
  db: Database,
  input: {
    q?: string | undefined;
    slot?: CatalogItem["slot"] | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
  }
): Promise<CatalogListResponse> => {
  const page = Math.max(input.page ?? 0, 0);
  const pageSize = Math.min(Math.max(input.pageSize ?? 24, 1), 60);
  const filters = [
    eq(catalogItems.published, true),
    eq(catalogItems.itemKind, "wearable")
  ];

  if (input.q) {
    filters.push(ilike(catalogItems.displayName, `%${input.q.trim()}%`));
  }

  if (input.slot) {
    filters.push(eq(catalogItems.slot, input.slot));
  }

  const whereClause = and(...filters);
  const [totalRow] = await db
    .select({ value: count() })
    .from(catalogItems)
    .where(whereClause);
  const total = totalRow?.value ?? 0;

  const rows = await db
    .select()
    .from(catalogItems)
    .where(whereClause)
    .orderBy(desc(catalogItems.updatedAt), catalogItems.displayName)
    .limit(pageSize)
    .offset(page * pageSize);

  const latestPriceMap = await hydrateLatestPrices(
    db,
    rows.map((row) => row.id)
  );

  return {
    items: rows.map((row) => mapCatalogItem(row, latestPriceMap.get(row.id))),
    page,
    pageSize,
    total
  };
};

export const getCatalogItemDetailBySlug = async (
  db: Database,
  slug: string
): Promise<CatalogItemDetail | null> => {
  const [item] = await db.select().from(catalogItems).where(eq(catalogItems.slug, slug)).limit(1);

  if (!item || !item.published) {
    return null;
  }

  const [latestPrice] = await db
    .select()
    .from(priceSnapshots)
    .where(eq(priceSnapshots.catalogItemId, item.id))
    .orderBy(desc(priceSnapshots.capturedAt))
    .limit(1);

  const [variant] = await db
    .select()
    .from(skinVariants)
    .where(eq(skinVariants.catalogItemId, item.id))
    .limit(1);

  const renderManifest = variant
    ? await db
        .select()
        .from(renderModels)
        .where(eq(renderModels.id, variant.renderModelId))
        .limit(1)
        .then(([renderModel]) => (renderModel ? mapRenderManifest(item, variant, renderModel) : null))
    : null;

  return {
    item: mapCatalogItem(item, latestPrice ?? null),
    renderManifest,
    matchStatus: variant?.matchStatus ?? "review",
    notes: variant?.notes ?? []
  };
};

export const listInternalStatus = async (db: Database): Promise<InternalStatus> => {
  const runs = await db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(12);
  const reviews = await db
    .select()
    .from(matchReviews)
    .where(isNull(matchReviews.resolvedAt))
    .orderBy(desc(matchReviews.createdAt))
    .limit(12);
  const [unpublishedRow] = await db
    .select({ value: count() })
    .from(catalogItems)
    .where(and(eq(catalogItems.itemKind, "wearable"), eq(catalogItems.published, false)));
  const unpublishedWearables = unpublishedRow?.value ?? 0;
  const [failedRow] = await db
    .select({ value: count() })
    .from(matchReviews)
    .where(sql`${matchReviews.reason} ilike '%import%'`);
  const failedImports = failedRow?.value ?? 0;

  return {
    recentRuns: runs.map(
      (run): SyncRun => ({
        id: run.id,
        job: run.job as SyncJob,
        status: run.status,
        cursor: run.cursor,
        stats: run.stats,
        startedAt: run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() ?? null,
        errorMessage: run.errorMessage ?? null
      })
    ),
    matchReviews: reviews.map(
      (review): MatchReview => ({
        id: review.id,
        marketHashName: review.marketHashName,
        reason: review.reason,
        confidence: review.confidence / 10_000,
        createdAt: review.createdAt.toISOString()
      })
    ),
    unpublishedWearables,
    failedImports
  };
};

export const upsertMarketItem = async (
  db: Database,
  input: {
    id: string;
    source: "steam" | "skinport";
    marketHashName: string;
    classId?: string | null | undefined;
    iconUrl?: string | null | undefined;
    currency: string;
    sellPriceMinor?: number | null | undefined;
    sellListings?: number | null | undefined;
    classifiedItemKind?: "wearable" | "non_renderable" | undefined;
    classifiedTemplate?: string | null | undefined;
    classifiedSlot?: CatalogItem["slot"] | undefined;
    emissive: boolean;
    rawPayload: Record<string, unknown>;
  }
) =>
  db
    .insert(marketItemsRaw)
    .values({
      id: input.id,
      source: input.source,
      marketHashName: input.marketHashName,
      classId: input.classId ?? null,
      iconUrl: input.iconUrl ?? null,
      currency: input.currency,
      sellPriceMinor: input.sellPriceMinor ?? null,
      sellListings: input.sellListings ?? null,
      classifiedItemKind: input.classifiedItemKind,
      classifiedTemplate: input.classifiedTemplate ?? null,
      classifiedSlot: input.classifiedSlot ?? null,
      emissive: input.emissive,
      rawPayload: input.rawPayload,
      lastSeenAt: new Date()
    })
    .onConflictDoUpdate({
      target: [marketItemsRaw.source, marketItemsRaw.marketHashName],
      set: {
        classId: input.classId ?? null,
        iconUrl: input.iconUrl ?? null,
        currency: input.currency,
        sellPriceMinor: input.sellPriceMinor ?? null,
        sellListings: input.sellListings ?? null,
        classifiedItemKind: input.classifiedItemKind,
        classifiedTemplate: input.classifiedTemplate ?? null,
        classifiedSlot: input.classifiedSlot ?? null,
        emissive: input.emissive,
        rawPayload: input.rawPayload,
        lastSeenAt: new Date()
      }
    });

export const upsertCatalogItem = async (db: Database, item: CatalogItem) =>
  db
    .insert(catalogItems)
    .values({
      id: item.id,
      slug: item.slug,
      displayName: item.displayName,
      baseTemplate: item.baseTemplate,
      itemKind: item.itemKind,
      renderTarget: item.renderTarget,
      slot: item.slot ?? null,
      layerOrder: item.layerOrder,
      published: item.published,
      emissive: item.emissive,
      marketHashName: item.marketHashName,
      iconUrl: item.iconUrl ?? null,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: catalogItems.marketHashName,
      set: {
        slug: item.slug,
        displayName: item.displayName,
        baseTemplate: item.baseTemplate,
        itemKind: item.itemKind,
        renderTarget: item.renderTarget,
        slot: item.slot ?? null,
        layerOrder: item.layerOrder,
        published: sql<boolean>`${catalogItems.published} OR ${item.published}`,
        emissive: item.emissive,
        iconUrl: item.iconUrl ?? null,
        updatedAt: new Date()
      }
    });

export const listWearableMarketItems = async (db: Database) =>
  db
    .select()
    .from(marketItemsRaw)
    .where(eq(marketItemsRaw.classifiedItemKind, "wearable"))
    .orderBy(marketItemsRaw.marketHashName);

export const listWearableCatalogItems = async (db: Database) =>
  db
    .select()
    .from(catalogItems)
    .where(eq(catalogItems.itemKind, "wearable"))
    .orderBy(catalogItems.displayName);

export const getMarketItemsByHashNames = async (db: Database, marketHashNames: string[]) =>
  marketHashNames.length
    ? db
        .select()
        .from(marketItemsRaw)
        .where(inArray(marketItemsRaw.marketHashName, marketHashNames))
    : [];

export const upsertRenderModel = async (
  db: Database,
  input: typeof renderModels.$inferInsert
) =>
  db
    .insert(renderModels)
    .values(input)
    .onConflictDoUpdate({
      target: renderModels.id,
      set: {
        slug: input.slug,
        label: input.label,
        renderTarget: input.renderTarget,
        slot: input.slot,
        skeletonProfile: input.skeletonProfile,
        bodyMasks: input.bodyMasks,
        suppressesSlots: input.suppressesSlots,
        defaultGlbUrl: input.defaultGlbUrl,
        defaultTextureSet: input.defaultTextureSet,
        updatedAt: new Date()
      }
    });

export const upsertSkinVariant = async (
  db: Database,
  input: typeof skinVariants.$inferInsert
) =>
  db
    .insert(skinVariants)
    .values(input)
    .onConflictDoUpdate({
      target: skinVariants.catalogItemId,
      set: {
        renderModelId: input.renderModelId,
        glbUrl: input.glbUrl,
        textureSet: input.textureSet,
        matchStatus: input.matchStatus,
        importVersion: input.importVersion,
        notes: input.notes,
        updatedAt: new Date()
      }
    });

export const createMatchReview = async (
  db: Database,
  input: typeof matchReviews.$inferInsert
) =>
  db
    .insert(matchReviews)
    .values(input)
    .onConflictDoNothing();

export const publishCatalogItem = async (db: Database, catalogItemId: string, published = true) =>
  db
    .update(catalogItems)
    .set({
      published,
      updatedAt: new Date()
    })
    .where(eq(catalogItems.id, catalogItemId));

export const insertPriceSnapshot = async (
  db: Database,
  input: typeof priceSnapshots.$inferInsert
) =>
  db
    .insert(priceSnapshots)
    .values(input)
    .onConflictDoUpdate({
      target: [
        priceSnapshots.source,
        priceSnapshots.catalogItemId,
        priceSnapshots.currency,
        priceSnapshots.capturedDay
      ],
      set: {
        priceMinor: input.priceMinor,
        listings: input.listings,
        capturedAt: input.capturedAt
      }
    });

export const listPublishedCatalogRows = async (db: Database) =>
  db
    .select()
    .from(catalogItems)
    .where(and(eq(catalogItems.published, true), eq(catalogItems.itemKind, "wearable")));

export const createSyncRun = async (
  db: Database,
  run: typeof syncRuns.$inferInsert
) => db.insert(syncRuns).values(run);

export const updateSyncRun = async (
  db: Database,
  id: string,
  patch: Partial<typeof syncRuns.$inferInsert>
) =>
  db
    .update(syncRuns)
    .set(patch)
    .where(eq(syncRuns.id, id));

export const getRunningSyncRun = async (db: Database, job: SyncJob) =>
  db
    .select()
    .from(syncRuns)
    .where(and(eq(syncRuns.job, job), eq(syncRuns.status, "running")))
    .orderBy(desc(syncRuns.startedAt))
    .limit(1)
    .then(([run]) => run ?? null);
