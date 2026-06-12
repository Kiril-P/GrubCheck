import {
  type BiomeKey,
  type EquipSlot,
  type MatchStatus,
  type PriceSource,
  type RenderTarget,
  type SyncJob,
  type TextureSet
} from "@grubcheck/domain";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const priceSourceEnum = pgEnum("price_source", ["steam", "skinport"]);
export const itemKindEnum = pgEnum("item_kind", ["wearable", "non_renderable"]);
export const renderTargetEnum = pgEnum("render_target", ["mannequin", "none"]);
export const equipSlotEnum = pgEnum("equip_slot", [
  "head",
  "face",
  "torso",
  "hands",
  "legs",
  "feet",
  "back"
]);
export const biomeKeyEnum = pgEnum("biome_key", ["neutral", "forest", "desert", "snow"]);
export const matchStatusEnum = pgEnum("match_status", ["matched", "review", "unmatched", "failed"]);
export const syncJobEnum = pgEnum("sync_job", [
  "steam_market_catalog",
  "asset_import",
  "asset_match",
  "price_snapshot"
]);
export const syncRunStatusEnum = pgEnum("sync_run_status", ["running", "succeeded", "failed"]);

export const marketItemsRaw = pgTable(
  "market_items_raw",
  {
    id: text("id").primaryKey(),
    source: priceSourceEnum("source").$type<PriceSource>().notNull(),
    marketHashName: text("market_hash_name").notNull(),
    classId: text("class_id"),
    iconUrl: text("icon_url"),
    currency: text("currency").notNull().default("EUR"),
    sellPriceMinor: integer("sell_price_minor"),
    sellListings: integer("sell_listings"),
    classifiedItemKind: itemKindEnum("classified_item_kind"),
    classifiedTemplate: text("classified_template"),
    classifiedSlot: equipSlotEnum("classified_slot").$type<EquipSlot>(),
    emissive: boolean("emissive").notNull().default(false),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("market_items_raw_source_hash_idx").on(table.source, table.marketHashName)
  ]
);

export const catalogItems = pgTable(
  "catalog_items",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    baseTemplate: text("base_template").notNull(),
    itemKind: itemKindEnum("item_kind").notNull(),
    renderTarget: renderTargetEnum("render_target").$type<RenderTarget>().notNull(),
    slot: equipSlotEnum("slot").$type<EquipSlot>(),
    layerOrder: integer("layer_order").notNull().default(0),
    published: boolean("published").notNull().default(false),
    emissive: boolean("emissive").notNull().default(false),
    marketHashName: text("market_hash_name").notNull(),
    iconUrl: text("icon_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("catalog_items_slug_idx").on(table.slug),
    uniqueIndex("catalog_items_market_hash_idx").on(table.marketHashName)
  ]
);

export const renderModels = pgTable(
  "render_models",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    renderTarget: renderTargetEnum("render_target").$type<RenderTarget>().notNull().default("mannequin"),
    slot: equipSlotEnum("slot").$type<EquipSlot>().notNull(),
    skeletonProfile: text("skeleton_profile").notNull(),
    bodyMasks: jsonb("body_masks").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    suppressesSlots:
      jsonb("suppresses_slots").$type<EquipSlot[]>().notNull().default(sql`'[]'::jsonb`),
    defaultGlbUrl: text("default_glb_url"),
    defaultTextureSet:
      jsonb("default_texture_set").$type<TextureSet>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("render_models_slug_idx").on(table.slug)]
);

export const skinVariants = pgTable(
  "skin_variants",
  {
    id: text("id").primaryKey(),
    catalogItemId: text("catalog_item_id")
      .notNull()
      .references(() => catalogItems.id, { onDelete: "cascade" }),
    renderModelId: text("render_model_id")
      .notNull()
      .references(() => renderModels.id, { onDelete: "cascade" }),
    glbUrl: text("glb_url"),
    textureSet: jsonb("texture_set").$type<TextureSet>().notNull().default(sql`'{}'::jsonb`),
    matchStatus: matchStatusEnum("match_status").$type<MatchStatus>().notNull().default("review"),
    importVersion: integer("import_version").notNull().default(1),
    notes: jsonb("notes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("skin_variants_catalog_item_idx").on(table.catalogItemId)]
);

export const priceSnapshots = pgTable(
  "price_snapshots",
  {
    id: text("id").primaryKey(),
    source: priceSourceEnum("source").$type<PriceSource>().notNull(),
    catalogItemId: text("catalog_item_id")
      .notNull()
      .references(() => catalogItems.id, { onDelete: "cascade" }),
    currency: text("currency").notNull().default("EUR"),
    priceMinor: integer("price_minor"),
    listings: integer("listings"),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    capturedDay: date("captured_day").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("price_snapshots_day_idx").on(
      table.source,
      table.catalogItemId,
      table.currency,
      table.capturedDay
    )
  ]
);

export const biomePresetsTable = pgTable("biome_presets", {
  key: biomeKeyEnum("key").$type<BiomeKey>().primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const matchReviews = pgTable("match_reviews", {
  id: text("id").primaryKey(),
  catalogItemId: text("catalog_item_id").references(() => catalogItems.id, { onDelete: "set null" }),
  marketHashName: text("market_hash_name").notNull(),
  reason: text("reason").notNull(),
  confidence: integer("confidence_basis_points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true })
});

export const syncRuns = pgTable("sync_runs", {
  id: text("id").primaryKey(),
  job: syncJobEnum("job").$type<SyncJob>().notNull(),
  status: syncRunStatusEnum("status").notNull(),
  cursor: integer("cursor").notNull().default(0),
  stats: jsonb("stats").$type<Record<string, number>>().notNull().default(sql`'{}'::jsonb`),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorMessage: text("error_message")
});

export const catalogItemsRelations = relations(catalogItems, ({ one, many }) => ({
  variant: one(skinVariants, {
    fields: [catalogItems.id],
    references: [skinVariants.catalogItemId]
  }),
  latestPrices: many(priceSnapshots),
  matchReviews: many(matchReviews)
}));

export const skinVariantsRelations = relations(skinVariants, ({ one }) => ({
  catalogItem: one(catalogItems, {
    fields: [skinVariants.catalogItemId],
    references: [catalogItems.id]
  }),
  renderModel: one(renderModels, {
    fields: [skinVariants.renderModelId],
    references: [renderModels.id]
  })
}));

