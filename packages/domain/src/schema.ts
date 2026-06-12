import { z } from "zod";

export const priceSourceSchema = z.enum(["steam", "skinport"]);
export const itemKindSchema = z.enum(["wearable", "non_renderable"]);
export const renderTargetSchema = z.enum(["mannequin", "none"]);
export const equipSlotSchema = z.enum([
  "head",
  "face",
  "torso",
  "hands",
  "legs",
  "feet",
  "back"
]);
export const biomeKeySchema = z.enum(["neutral", "forest", "desert", "snow"]);
export const matchStatusSchema = z.enum(["matched", "review", "unmatched", "failed"]);
export const syncJobSchema = z.enum([
  "steam_market_catalog",
  "asset_import",
  "asset_match",
  "price_snapshot"
]);
export const syncRunStatusSchema = z.enum(["running", "succeeded", "failed"]);

export const lightRigSchema = z.object({
  ambientIntensity: z.number(),
  directionalIntensity: z.number(),
  directionalPosition: z.tuple([z.number(), z.number(), z.number()]),
  hemisphereSky: z.string(),
  hemisphereGround: z.string()
});

export const backgroundSchema = z.object({
  top: z.string(),
  bottom: z.string(),
  accent: z.string(),
  fog: z.string()
});

export const cameraPresetSchema = z.object({
  position: z.tuple([z.number(), z.number(), z.number()]),
  target: z.tuple([z.number(), z.number(), z.number()]),
  fov: z.number()
});

export const biomePresetSchema = z.object({
  key: biomeKeySchema,
  label: z.string(),
  description: z.string(),
  environmentMapUrl: z.string().optional(),
  lightRig: lightRigSchema,
  background: backgroundSchema,
  camera: cameraPresetSchema
});

export const latestPriceSchema = z.object({
  source: priceSourceSchema,
  currency: z.string(),
  priceMinor: z.number().int().nonnegative().nullable(),
  listings: z.number().int().nonnegative().nullable(),
  capturedAt: z.string().datetime()
});

export const textureSetSchema = z.object({
  diffuseUrl: z.string().optional(),
  normalUrl: z.string().optional(),
  emissiveUrl: z.string().optional(),
  previewColor: z.string().optional()
});

export const renderTransformSchema = z.object({
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  scale: z.tuple([z.number(), z.number(), z.number()]).default([1, 1, 1])
});

export const renderManifestSchema = z.object({
  renderModelId: z.string(),
  slot: equipSlotSchema,
  layerOrder: z.number().int(),
  skeletonProfile: z.string(),
  bodyMasks: z.array(z.string()),
  suppressesSlots: z.array(equipSlotSchema),
  glbUrl: z.string().optional(),
  textureSet: textureSetSchema,
  transform: renderTransformSchema.optional(),
  emissiveEnabled: z.boolean()
});

export const catalogItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  displayName: z.string(),
  baseTemplate: z.string(),
  itemKind: itemKindSchema,
  renderTarget: renderTargetSchema,
  slot: equipSlotSchema.nullable(),
  layerOrder: z.number().int(),
  published: z.boolean(),
  emissive: z.boolean(),
  marketHashName: z.string(),
  iconUrl: z.string().optional(),
  latestPrice: latestPriceSchema.nullable(),
  priceUpdatedAt: z.string().datetime().nullable()
});

export const catalogItemDetailSchema = z.object({
  item: catalogItemSchema,
  renderManifest: renderManifestSchema.nullable(),
  matchStatus: matchStatusSchema,
  notes: z.array(z.string())
});

export const catalogListResponseSchema = z.object({
  items: z.array(catalogItemSchema),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative()
});

export const syncRunSchema = z.object({
  id: z.string(),
  job: syncJobSchema,
  status: syncRunStatusSchema,
  cursor: z.number().int().nonnegative(),
  stats: z.record(z.string(), z.number()).default({}),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable()
});

export const matchReviewSchema = z.object({
  id: z.string(),
  marketHashName: z.string(),
  reason: z.string(),
  confidence: z.number(),
  createdAt: z.string().datetime()
});

export const internalStatusSchema = z.object({
  recentRuns: z.array(syncRunSchema),
  matchReviews: z.array(matchReviewSchema),
  unpublishedWearables: z.number().int().nonnegative(),
  failedImports: z.number().int().nonnegative()
});

export type PriceSource = z.infer<typeof priceSourceSchema>;
export type ItemKind = z.infer<typeof itemKindSchema>;
export type RenderTarget = z.infer<typeof renderTargetSchema>;
export type EquipSlot = z.infer<typeof equipSlotSchema>;
export type BiomeKey = z.infer<typeof biomeKeySchema>;
export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type SyncJob = z.infer<typeof syncJobSchema>;
export type SyncRunStatus = z.infer<typeof syncRunStatusSchema>;
export type BiomePreset = z.infer<typeof biomePresetSchema>;
export type LatestPrice = z.infer<typeof latestPriceSchema>;
export type TextureSet = z.infer<typeof textureSetSchema>;
export type RenderTransform = z.infer<typeof renderTransformSchema>;
export type RenderManifest = z.infer<typeof renderManifestSchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type CatalogItemDetail = z.infer<typeof catalogItemDetailSchema>;
export type CatalogListResponse = z.infer<typeof catalogListResponseSchema>;
export type SyncRun = z.infer<typeof syncRunSchema>;
export type MatchReview = z.infer<typeof matchReviewSchema>;
export type InternalStatus = z.infer<typeof internalStatusSchema>;
